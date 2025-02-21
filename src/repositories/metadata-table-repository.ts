import MetadataTable from '../models/metadata-table';
import { Transaction, WhereOptions } from 'sequelize';

class MetadataTableRepository {
  static async findOne(condition: WhereOptions, transaction?: Transaction) {
    return await MetadataTable.findOne({ where: condition, transaction });
  }

  static async insert(data: { table_name: string }, transaction?: Transaction) {
    return await MetadataTable.create(data, { transaction });
  }

  static async update(
    condition: WhereOptions,
    updatedData: { table_name: string },
    transaction?: Transaction,
  ) {
    return await MetadataTable.update(updatedData, {
      where: condition,
      transaction,
    });
  }

  static async delete(condition: WhereOptions, transaction?: Transaction) {
    return await MetadataTable.destroy({ where: condition, transaction });
  }
}

export default MetadataTableRepository;
