import { sequelize } from '../../config/database';
import MetadataTableRepository from '../../repositories/metadata-table-repository';
import { validIdentifier } from '../../utils/validation';
import { Transaction } from 'sequelize';

export class AlterTable {
  static async execute(from: string, to: string, transaction: Transaction) {
    if (!from || !to) {
      throw new Error('Both old and new table names are required.');
    }

    if (!validIdentifier(from) || !validIdentifier(to)) {
      throw new Error('Invalid table name.');
    }

    if (from === to) {
      throw new Error(`Table name "${from}" and "${to}" are the same`);
    }

    const tableExists = await MetadataTableRepository.findOne(
      {
        table_name: from,
      },
      transaction,
    );
    if (!tableExists) {
      throw new Error(`Table "${from}" does not exist`);
    }

    const toTableExists = await MetadataTableRepository.findOne(
      {
        table_name: to,
      },
      transaction,
    );
    if (toTableExists) {
      throw new Error(`Table "${to}" already exists`);
    }

    const alterQuery = `ALTER TABLE "${from}" RENAME TO "${to}"`;
    console.log('Executing Query:', alterQuery);
    await sequelize.query(alterQuery, { transaction });

    await MetadataTableRepository.update(
      { table_name: from },
      { table_name: to },
      transaction,
    );

    await transaction.afterCommit(() => {
      console.log(`Table "${from}" successfully renamed to "${to}"`);
    });
  }
}
