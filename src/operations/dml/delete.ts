import { Transaction } from 'sequelize';
import { DeleteInstruction } from '../../types/dml';
import { DMLRepository } from '../../repositories/dml-repository';
import MetadataTableRepository from '../../repositories/metadata-table-repository';
import { validateCondition, validIdentifier } from '../../utils/validation';

export class DeleteOperation {
  static async execute(
    instruction: DeleteInstruction,
    transaction: Transaction,
  ) {
    const { table, condition, params } = instruction;

    if (!validIdentifier(table))
      throw new Error(`Invalid table name: ${table}`);

    if (typeof condition === 'object') {
      validateCondition(condition);
    }

    const metadataTable = await MetadataTableRepository.findOne(
      { table_name: table },
      transaction,
    );
    if (!metadataTable) throw new Error(`Table ${table} does not exist`);

    const result = await DMLRepository.delete(
      table,
      condition,
      params,
      transaction,
    );

    await transaction.afterCommit(() => {
      console.log(`Data deleted from ${table} successfully`);
    });

    return result;
  }
}
