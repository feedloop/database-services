import { QueryTypes, Transaction } from 'sequelize';
import { sequelize } from '../../config/database';
import MetadataColumnRepository from '../../repositories/metadata-column-repository';
import { validIdentifier } from '../../utils/validation';
import MetadataTableRepository from '../../repositories/metadata-table-repository';

export class CreateColumn {
  static async execute(
    table: string,
    migration: any,
    transaction: Transaction,
  ) {
    const columnName = migration.name;
    const columnDefinition = migration.column;

    if (!validIdentifier(table) || !validIdentifier(columnName)) {
      throw new Error('Invalid table or column name');
    }

    if (!columnName) throw new Error('Column name is missing');
    if (!columnDefinition || typeof columnDefinition !== 'object') {
      throw new Error('Column definition is missing or invalid');
    }

    const metadataTable = await MetadataTableRepository.findOne(
      { table_name: table },
      transaction,
    );
    if (!metadataTable) throw new Error(`Table ${table} does not exist`);

    const columnExists = await sequelize.query(
      `SELECT column_name FROM metadata_column WHERE table_id = :tableId AND column_name = :columnName`,
      {
        replacements: { tableId: metadataTable.id, columnName },
        type: QueryTypes.SELECT,
      },
    );

    if (columnExists.length > 0)
      throw new Error(`Column "${columnName}" already exists in "${table}"`);

    let colType = columnDefinition.type?.trim();
    if (!colType) throw new Error('Column type is missing');
    if (colType.toLowerCase() === 'datetime') colType = 'timestamp';

    let defaultValue = columnDefinition.default;
    if (defaultValue === 'now()') defaultValue = 'CURRENT_TIMESTAMP';

    const addColumnQuery = `
      ALTER TABLE "${table}" ADD COLUMN "${columnName}" ${colType}
      ${defaultValue !== undefined ? `DEFAULT ${defaultValue}` : ''} 
      ${columnDefinition.nullable ? '' : 'NOT NULL'} 
      ${columnDefinition.unique ? 'UNIQUE' : ''}
    `;

    await sequelize.query(addColumnQuery, { transaction });

    await MetadataColumnRepository.insert(
      {
        table_id: metadataTable.id,
        column_name: columnName,
        data_type: colType,
        is_primary: columnDefinition.primary ?? false,
        is_nullable: columnDefinition.nullable ?? true,
        is_unique: columnDefinition.unique ?? false,
      },
      transaction,
    );

    await transaction.afterCommit(async () => {
      console.log(`Column ${columnName} metadata saved successfully`);
    });
  }
}
