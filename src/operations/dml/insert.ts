import { Transaction } from 'sequelize';
import { InsertInstruction } from '../../types/dml';
import { DMLRepository } from '../../repositories/dml-repository';
import { parseAndValidateData, validIdentifier } from '../../utils/validation';

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

    const parsedData = await parseAndValidateData(table, data, transaction);
    const result = await DMLRepository.insert(table, parsedData, transaction);

    await transaction.afterCommit(() => {
      console.log(`Data inserted into ${table} successfully`);
    });

    return result[0][0].id;
  }
}
