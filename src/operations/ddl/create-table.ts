import { sequelize } from '../../config/database';
import MetadataTableRepository from '../../repositories/metadata-table-repository';

export class CreateTable {
  static async execute(name: string, columnDefinition: any, transaction: any) {
    if (!/^[a-zA-Z0-9_]+$/.test(name))
      throw new Error(`Invalid table name: ${name}`);

    const tableExists = await MetadataTableRepository.findOne({
      table_name: name,
    });
    if (tableExists) throw new Error(`Table ${name} already exists`);

    let idType = 'UUID PRIMARY KEY DEFAULT gen_random_uuid()';
    if (columnDefinition?.type?.toLowerCase() === 'serial')
      idType = 'SERIAL PRIMARY KEY';

    await sequelize.query(
      `CREATE TABLE IF NOT EXISTS "${name}" (id ${idType})`,
      { transaction },
    );

    await MetadataTableRepository.insert({ table_name: name });
  }
}
