import { QueryTypes, Transaction } from 'sequelize';
import { DeleteInstruction } from '../../types/dml';
import { DMLRepository } from '../../repositories/dml-repository';
import MetadataTableRepository from '../../repositories/metadata-table-repository';
import { sequelize } from '../../config/database';
import { parseConditionForQuery } from '../../utils/condition-parser';

export class DeleteOperation {
  static async execute(
    instruction: DeleteInstruction,
    transaction: Transaction,
  ) {
    const { table, condition, params } = instruction;

    const metadataTable = await MetadataTableRepository.findOne(
      { table_name: table },
      transaction,
    );
    if (!metadataTable) throw new Error(`Table ${table} does not exist`);

    const replacements: any[] = [];
    const whereClause = parseConditionForQuery(condition, replacements, params);

    const checkExistQuery = `SELECT EXISTS (SELECT 1 FROM "${table}" WHERE ${whereClause}) AS "exists"`;
    const [{ exists }] = (await sequelize.query(checkExistQuery, {
      type: QueryTypes.SELECT,
      bind: replacements,
      transaction,
    })) as { exists: boolean }[];

    if (!exists) {
      throw new Error(`No matching record found in table ${table} for update`);
    }

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
