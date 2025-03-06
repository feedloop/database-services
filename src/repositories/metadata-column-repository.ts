import { Transaction, WhereOptions } from 'sequelize';
import MetadataColumn from '../models/metadata-column';

interface MetadataColumnAttributes {
  table_id: string;
  column_name: string;
  data_type: string;
  is_primary: boolean;
  is_nullable: boolean;
  is_unique: boolean;
}

class MetadataColumnRepository {
  static async insert(
    data: MetadataColumnAttributes,
    transaction?: Transaction,
  ) {
    return await MetadataColumn.create(
      {
        ...data,
        is_primary: data.is_primary ?? false,
        is_nullable: data.is_nullable ?? true,
        is_unique: data.is_unique ?? false,
      },
      { transaction },
    );
  }

  static async update(
    table_id: string,
    column_name: string,
    updatedData: Partial<MetadataColumnAttributes>,
    transaction?: Transaction,
  ) {
    return await MetadataColumn.update(updatedData, {
      where: { table_id, column_name },
      transaction,
    });
  }

  static async delete(
    table_id: string,
    column_name: string,
    transaction?: Transaction,
  ) {
    return await MetadataColumn.destroy({
      where: { table_id, column_name },
      transaction,
    });
  }

  static async findOne(condition: WhereOptions, transaction?: Transaction) {
    return await MetadataColumn.findOne({ where: condition, transaction });
  }

  static async getAll(transaction?: Transaction) {
    return await MetadataColumn.findAll({ transaction });
  }
}

export default MetadataColumnRepository;
