import MetadataTable from '../models/metadata-table';
import { WhereOptions } from 'sequelize';

class MetadataTableRepository {
  static async findOne(condition: WhereOptions) {
    return await MetadataTable.findOne({ where: condition });
  }

  static async insert(data: { table_name: string }) {
    return await MetadataTable.create(data);
  }

  static async delete(condition: WhereOptions) {
    return await MetadataTable.destroy({ where: condition });
  }
}

export default MetadataTableRepository;
