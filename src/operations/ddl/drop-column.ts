import { sequelize } from '../../config/database';
import MetadataColumn from '../../models/metadata-column';
import MetadataTable from '../../models/metadata-table';

export class DropColumn {
  static async execute(table: string, column: string, transaction: any) {
    const metadataTable = await MetadataTable.findOne({
      where: { table_name: table },
    });
    if (!metadataTable) throw new Error(`Table "${table}" does not exist`);

    const existingColumn = await MetadataColumn.findOne({
      where: { table_id: metadataTable.id, column_name: column },
    });
    if (!existingColumn)
      throw new Error(`Column "${column}" does not exist in table "${table}"`);

    await sequelize.query(
      `ALTER TABLE "${table}" DROP COLUMN IF EXISTS "${column}"`,
      { transaction },
    );

    await MetadataColumn.destroy({
      where: { table_id: metadataTable.id, column_name: column },
      transaction,
    });
  }
}
