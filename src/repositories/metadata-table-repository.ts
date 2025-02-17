import MetadataTable from '../models/metadata-table';
import MetadataColumn from '../models/metadata-column';

class MetadataTableRepository {
  static async findByName(table_name: string) {
    return await MetadataTable.findOne({ where: { table_name } });
  }

  static async createTable(data: { table_name: string }) {
    return await MetadataTable.create(data);
  }

  static async isTableExists(tableName: string) {
    const table = await MetadataTable.findOne({
      where: { table_name: tableName },
    });
    return !!table;
  }

  static async deleteColumnsByTable(tableName: string) {
    return await MetadataColumn.destroy({
      where: { table_id: tableName },
    });
  }

  static async deleteTableByName(tableName: string) {
    return await MetadataTable.destroy({ where: { table_name: tableName } });
  }

  static async deleteColumnsByTableId(tableId: string) {
    return await MetadataColumn.destroy({ where: { table_id: tableId } });
  }
}

export default MetadataTableRepository;
