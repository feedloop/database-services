import { Transaction } from 'sequelize';
import { sequelize } from '../../config/database';
import { validIdentifier } from '../../utils/validation';
import MetadataColumnRepository from '../../repositories/metadata-column-repository';
import MetadataTableRepository from '../../repositories/metadata-table-repository';

export class DropColumn {
  static async execute(
    table: string,
    column: string,
    transaction: Transaction,
  ) {
    if (!validIdentifier(table) || !validIdentifier(column)) {
      throw new Error('Invalid table or column name');
    }

    const metadataTable = await MetadataTableRepository.findOne({
      where: { table_name: table },
    });
    if (!metadataTable) throw new Error(`Table "${table}" does not exist`);

    const existingColumn = await MetadataColumnRepository.findOne({
      where: { table_id: metadataTable.id, column_name: column },
    });
    if (!existingColumn)
      throw new Error(`Column "${column}" does not exist in table "${table}"`);

    await sequelize.query(
      `ALTER TABLE "${table}" DROP COLUMN IF EXISTS "${column}"`,
      { transaction },
    );

    await MetadataColumnRepository.delete(
      metadataTable.id,
      column,
      transaction,
    );

    transaction.afterCommit(() => {
      console.log(`Column "${column}" deleted from metadata.`);
    });
  }
}
