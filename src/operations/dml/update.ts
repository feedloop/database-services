import { Transaction } from 'sequelize';
import { UpdateInstruction } from '../../types/dml';
import { DMLRepository } from '../../repositories/dml-repository';
import MetadataTableRepository from '../../repositories/metadata-table-repository';
import {
  validateCondition,
  validateData,
  validIdentifier,
} from '../../utils/validation';

export class UpdateOperation {
  static async execute(
    instruction: UpdateInstruction,
    transaction: Transaction,
  ) {
    const { table, condition, set, params } = instruction;

    if (!validIdentifier(table))
      throw new Error(`Invalid table name: ${table}`);

    if (!set || Object.keys(set).length === 0)
      throw new Error('Update set cannot be empty');

    validateData(set);

    if (condition) {
      validateCondition(condition);
    }

    const metadataTable = await MetadataTableRepository.findOne(
      { table_name: table },
      transaction,
    );
    if (!metadataTable) throw new Error(`Table ${table} does not exist`);

    await DMLRepository.update(table, set, condition, params, transaction);

    await transaction.afterCommit(() => {
      console.log(`Data updated in ${table} successfully`);
    });
  }
}
