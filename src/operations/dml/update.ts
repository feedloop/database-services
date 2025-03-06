import { QueryTypes, Transaction } from 'sequelize';
import { UpdateInstruction } from '../../types/dml';
import { DMLRepository } from '../../repositories/dml-repository';
import MetadataTableRepository from '../../repositories/metadata-table-repository';
import { parseConditionForQuery } from '../../utils/condition-parser';
import { sequelize } from '../../config/database';

export class UpdateOperation {
  static async execute(
    instruction: UpdateInstruction,
    transaction: Transaction,
  ) {
    const { table, condition, set, params } = instruction;
    if (!set || Object.keys(set).length === 0)
      throw new Error('Update set cannot be empty');

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

    await DMLRepository.update(table, set, condition, params, transaction);

    await transaction.afterCommit(() => {
      console.log(`Data updated in ${table} successfully`);
    });
  }
}
