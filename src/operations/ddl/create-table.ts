import { Transaction } from 'sequelize';
import { sequelize } from '../../config/database';
import MetadataTableRepository from '../../repositories/metadata-table-repository';
import { validIdentifier } from '../../utils/validation';

export class CreateTable {
  static async execute(name: string, migration: any, transaction: Transaction) {
    if (!validIdentifier(name)) {
      throw new Error(`Invalid table name: ${name}`);
    }

    const tableExists = await MetadataTableRepository.findOne(
      {
        table_name: name,
      },
      transaction,
    );
    if (tableExists) throw new Error(`Table ${name} already exists`);

    let idType = 'UUID PRIMARY KEY DEFAULT gen_random_uuid()';
    if (migration?.type?.toLowerCase() === 'serial')
      idType = 'SERIAL PRIMARY KEY';

    await sequelize.query(
      `CREATE TABLE IF NOT EXISTS "${name}" (id ${idType})`,
      { transaction },
    );

    await MetadataTableRepository.insert({ table_name: name }, transaction);

    await transaction.afterCommit(async () => {
      console.log(`Table ${name} metadata saved successfully`);
    });
  }
}
