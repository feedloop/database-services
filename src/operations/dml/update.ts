import { Transaction } from 'sequelize';
import { UpdateInstruction } from '../../types/dml';
import { DMLRepository } from '../../repositories/dml-repository';
import {
  validateCondition,
  validateDataType,
  validateSQL,
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

    validateSQL(set);
    await validateDataType(table, set, transaction);

    if (condition) {
      validateSQL(condition);
      validateCondition(condition);
    }

    const result = await DMLRepository.update(
      table,
      set,
      condition,
      params,
      transaction,
    );

    await transaction.afterCommit(() => {
      console.log(`Data updated in ${table} successfully`);
    });

    return result;
  }
}
