import { Transaction } from 'sequelize';
import { SelectInstruction } from '../../types/dml';
import { DMLRepository } from '../../repositories/dml-repository';
import MetadataTableRepository from '../../repositories/metadata-table-repository';

export class SelectOperation {
  static async execute(
    instruction: SelectInstruction,
    transaction: Transaction,
  ) {
    const { table, condition, orderBy, limit, offset, params } = instruction;

    const metadataTable = await MetadataTableRepository.findOne(
      { table_name: table },
      transaction,
    );
    if (!metadataTable) {
      throw new Error(`Table ${table} does not exist`);
    }

    const result = await DMLRepository.select(
      table,
      condition || {},
      orderBy,
      limit,
      offset,
      params,
      transaction,
    );

    if (!result || result.length === 0) {
      return { message: 'No data found' };
    }

    return result;
  }
}
