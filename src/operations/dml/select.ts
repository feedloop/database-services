import { Transaction } from 'sequelize';
import { SelectInstruction } from '../../types/dml';
import { DMLRepository } from '../../repositories/dml-repository';
import MetadataTableRepository from '../../repositories/metadata-table-repository';
import {
  parseAndValidateCondition,
  validIdentifier,
} from '../../utils/validation';

export class SelectOperation {
  static async execute(
    instruction: SelectInstruction,
    transaction: Transaction,
  ) {
    const { table, condition, orderBy, limit, offset, params } = instruction;

    if (!validIdentifier(table))
      throw new Error(`Invalid table name: ${table}`);

    const metadataTable = await MetadataTableRepository.findOne(
      { table_name: table },
      transaction,
    );
    if (!metadataTable) {
      throw new Error(`Table ${table} does not exist`);
    }

    const parsedCondition = condition
      ? parseAndValidateCondition(condition)
      : {};
    const result = await DMLRepository.select(
      table,
      parsedCondition,
      orderBy,
      limit,
      offset,
      params,
      transaction,
    );

    return result;
  }
}
