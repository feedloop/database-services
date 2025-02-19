import { sequelize } from '../../config/database';
import MetadataTableRepository from '../../repositories/metadata-table-repository';

export class DropTable {
  static async execute(name: string, transaction: any) {
    if (!/^[a-zA-Z0-9_]+$/.test(name)) throw new Error('Invalid table name');

    const tableExists = await MetadataTableRepository.findOne({
      table_name: name,
    });
    if (!tableExists) throw new Error(`Table ${name} does not exist`);

    await sequelize.query(`DROP TABLE IF EXISTS "${name}" CASCADE`, {
      transaction,
    });

    await MetadataTableRepository.delete({ table_name: name });
  }
}
