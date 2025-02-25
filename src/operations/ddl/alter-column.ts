import { Transaction } from 'sequelize';
import { sequelize } from '../../config/database';
import { validIdentifier } from '../../utils/validation';
import MetadataColumnRepository from '../../repositories/metadata-column-repository';
import MetadataTableRepository from '../../repositories/metadata-table-repository';

export interface AlterColumnDefinition {
  nullable?: boolean;
  default?: any;
  unique?: boolean;
}

export class AlterColumn {
  static async execute(
    table: string,
    from: string,
    to: string,
    columnDefinition: AlterColumnDefinition,
    transaction: Transaction,
  ) {
    if (!table || !from || !to)
      throw new Error('Table name and column names are required.');

    const metadataTable = await MetadataTableRepository.findOne(
      {
        table_name: table,
      },
      transaction,
    );
    if (!metadataTable) throw new Error(`Table "${table}" does not exist.`);

    const existingColumn = await MetadataColumnRepository.findOne(
      {
        table_id: metadataTable.id,
        column_name: from,
      },
      transaction,
    );
    if (!existingColumn) throw new Error(`Column "${from}" does not exist.`);

    const alterQueries: string[] = [];

    if (from !== to) {
      if (!validIdentifier(from) || !validIdentifier(to)) {
        throw new Error('Invalid column name');
      }
      alterQueries.push(`RENAME COLUMN "${from}" TO "${to}"`);
    }

    if (typeof columnDefinition.nullable === 'boolean') {
      alterQueries.push(
        columnDefinition.nullable
          ? `ALTER COLUMN "${to}" DROP NOT NULL`
          : `ALTER COLUMN "${to}" SET NOT NULL`,
      );
    }

    if (columnDefinition.default) {
      alterQueries.push(
        columnDefinition.default === null
          ? `ALTER COLUMN "${to}" DROP DEFAULT`
          : `ALTER COLUMN "${to}" SET DEFAULT ${columnDefinition.default}`,
      );
    }

    if (typeof columnDefinition.unique === 'boolean') {
      if (columnDefinition.unique) {
        alterQueries.push(
          `ADD CONSTRAINT unique_${table}_${to} UNIQUE ("${to}")`,
        );
      } else {
        alterQueries.push(`DROP CONSTRAINT IF EXISTS unique_${table}_${to}`);
      }
    }

    if (alterQueries.length > 0) {
      const renameQuery = alterQueries.find((query) =>
        query.startsWith('RENAME COLUMN'),
      );
      const otherQueries = alterQueries.filter(
        (query) => !query.startsWith('RENAME COLUMN'),
      );

      if (renameQuery) {
        console.log(
          'Executing Query:',
          `ALTER TABLE "${table}" ${renameQuery}`,
        );
        await sequelize.query(`ALTER TABLE "${table}" ${renameQuery}`, {
          transaction,
        });
      }

      if (otherQueries.length > 0) {
        const fullQuery = `ALTER TABLE "${table}" ${otherQueries.join(', ')}`;
        console.log('Executing Query:', fullQuery);
        await sequelize.query(fullQuery, { transaction });
      }
    }

    await MetadataColumnRepository.update(
      metadataTable.id,
      from,
      {
        column_name: to,
        is_nullable: columnDefinition?.nullable ?? existingColumn.is_nullable,
        is_unique: columnDefinition?.unique ?? existingColumn.is_unique,
      },
      transaction,
    );

    await transaction.afterCommit(() => {
      console.log(`Column "${from}" successfully renamed to "${to}"`);
    });
  }
}
