import { Transaction } from 'sequelize';
import { UpdateInstruction } from '../../types/dml';
import { DMLRepository } from '../../repositories/dml-repository';
import {
  parseAndValidateCondition,
  parseAndValidateData,
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

    const parsedSet = await parseAndValidateData(table, set, transaction);
    const parsedCondition = condition
      ? parseAndValidateCondition(condition)
      : {};

    const result = await DMLRepository.update(
      table,
      parsedSet,
      parsedCondition,
      params,
      transaction,
    );

    await transaction.afterCommit(() => {
      console.log(`Data updated in ${table} successfully`);
    });

    return result;
  }
}
