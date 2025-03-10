import { Transaction } from 'sequelize';
import { InsertInstruction } from '../../types/dml';
import { DMLRepository } from '../../repositories/dml-repository';
import { validateData, validIdentifier } from '../../utils/validation';
import MetadataTableRepository from '../../repositories/metadata-table-repository';

export class InsertOperation {
  static async execute(
    instruction: InsertInstruction,
    transaction: Transaction,
  ) {
    const { table, data } = instruction;

    if (!validIdentifier(table)) {
      throw new Error(`Invalid table name: ${table}`);
    }

    if (!data || Object.keys(data).length === 0) {
      throw new Error('Insert data cannot be empty');
    }

    validateData(data);

    const metadataTable = await MetadataTableRepository.findOne(
      { table_name: table },
      transaction,
    );
    if (!metadataTable) throw new Error(`Table ${table} does not exist`);

    await DMLRepository.insert(table, data, transaction);

    await transaction.afterCommit(() => {
      console.log(`Data inserted into ${table} successfully`);
    });
  }
}
