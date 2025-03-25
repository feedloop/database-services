import MetadataTable from '../models/metadata-table';
import MetadataColumn from '../models/metadata-column';
import { Transaction } from 'sequelize';

class SchemaRepository {
  static async getSchemas(transaction?: Transaction) {
    return MetadataTable.findAll({
      include: [
        {
          model: MetadataColumn,
          as: 'columns',
          attributes: [
            'id',
            'column_name',
            'data_type',
            'is_primary',
            'is_nullable',
            'is_unique',
          ],
        },
      ],
      attributes: ['id', 'table_name'],
      transaction,
    });
  }
}

export default SchemaRepository;
