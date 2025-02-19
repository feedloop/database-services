import { sequelize } from '../../config/database';
import MetadataColumn from '../../models/metadata-column';
import MetadataTable from '../../models/metadata-table';

export class AlterColumn {
  static async execute(
    table: string,
    from: string,
    to: string,
    columnDefinition: any,
    transaction: any,
  ) {
    if (!table || !from || !to)
      throw new Error('Table name and column names are required.');

    const metadataTable = await MetadataTable.findOne({
      where: { table_name: table },
    });
    if (!metadataTable) throw new Error(`Table "${table}" does not exist.`);

    const existingColumn = await MetadataColumn.findOne({
      where: { table_id: metadataTable.id, column_name: from },
    });
    if (!existingColumn) throw new Error(`Column "${from}" does not exist.`);

    const alterQueries: string[] = [];

    if (from !== to) {
      alterQueries.push(`RENAME COLUMN "${from}" TO "${to}"`);
    }

    if (columnDefinition?.nullable !== undefined) {
      alterQueries.push(
        `ALTER COLUMN "${to}" ${columnDefinition.nullable ? 'DROP NOT NULL' : 'SET NOT NULL'}`,
      );
    }

    if (columnDefinition?.default !== undefined) {
      let defaultValue = columnDefinition.default;
      if (defaultValue === 'now()') defaultValue = 'CURRENT_TIMESTAMP';

      alterQueries.push(
        defaultValue === null
          ? `ALTER COLUMN "${to}" DROP DEFAULT`
          : `ALTER COLUMN "${to}" SET DEFAULT ${defaultValue}`,
      );
    }

    if (alterQueries.length > 0) {
      for (const query of alterQueries) {
        await sequelize.query(`ALTER TABLE "${table}" ${query}`, {
          transaction,
        });
      }
    }

    await existingColumn.update({
      column_name: to,
      is_nullable: columnDefinition?.nullable ?? existingColumn.is_nullable,
    });
  }
}
