import MetadataColumn from '../models/metadata-column';

class MetadataColumnRepository {
  static async createColumn(data: {
    table_id: string;
    column_name: string;
    data_type: string;
    is_primary?: boolean;
    is_nullable?: boolean;
    is_unique?: boolean;
  }) {
    return await MetadataColumn.create(data);
  }

  static async updateColumn(
    table_id: string,
    column_name: string,
    updatedData: Partial<MetadataColumn>,
  ) {
    return await MetadataColumn.update(updatedData, {
      where: { table_id, column_name },
    });
  }

  static async deleteColumn(table_id: string, column_name: string) {
    return await MetadataColumn.destroy({
      where: { table_id, column_name },
    });
  }
}

export default MetadataColumnRepository;
