import { sequelize } from '../config/database';
import { QueryTypes, Transaction } from 'sequelize';
import { validIdentifier } from '../utils/validation';
import { ConditionOperator } from '../types/dml';
import {
  parseConditionForNamedParams,
  parseConditionForQuery,
} from '../utils/condition-parser';

export class DMLRepository {
  static async insert(
    table: string,
    data: Record<string, any>,
    transaction?: Transaction,
  ) {
    // console.log('Sequelize Dialect:', sequelize.getDialect());

    const keys = Object.keys(data);
    const values = Object.values(data);

    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const query = `INSERT INTO "${table}" (${keys.map((key) => `"${key}"`).join(', ')}) VALUES (${placeholders}) RETURNING *`;

    const result = await sequelize.query(query, {
      type: QueryTypes.INSERT,
      bind: values,
      transaction,
    });
    // console.log('QUERY RESULT:', result);
    return result;
  }

  static async update(
    table: string,
    set: Record<string, any>,
    condition: ConditionOperator,
    params?: Record<string, any>,
    transaction?: Transaction,
  ) {
    if (!validIdentifier(table))
      throw new Error(`Invalid table name: ${table}`);

    if (!set || Object.keys(set).length === 0)
      throw new Error('Update set cannot be empty');

    let query = `UPDATE "${table}" SET `;
    const setClauses: string[] = [];
    const replacements: any[] = [];
    let index = 1;

    for (const [key, value] of Object.entries(set)) {
      setClauses.push(`"${key}" = $${index}`);
      replacements.push(value);
      index++;
    }
    query += setClauses.join(', ');

    const whereClause = parseConditionForQuery(condition, replacements, params);
    query += ` WHERE ${whereClause}`;

    // console.log("QUERY:", query);
    // console.log("REPLACEMENTS:", replacements);

    return await sequelize.query(query, {
      type: QueryTypes.UPDATE,
      bind: replacements,
      transaction,
    });
  }

  static async delete(
    table: string,
    condition: ConditionOperator,
    params?: Record<string, any>,
    transaction?: Transaction,
  ) {
    if (!validIdentifier(table))
      throw new Error(`Invalid table name: ${table}`);

    let query = `DELETE FROM "${table}"`;
    const replacements: any[] = [];

    const whereClause = parseConditionForQuery(condition, replacements, params);
    query += ` WHERE ${whereClause}`;

    // console.log("QUERY:", query);
    // console.log("REPLACEMENTS:", replacements);

    await sequelize.query(query, {
      type: QueryTypes.DELETE,
      bind: replacements,
      transaction,
    });
  }

  public static async select(
    table: string,
    condition: any,
    orderBy?: Record<string, 'ASC' | 'DESC'>,
    limit?: number,
    offset?: number,
    params?: Record<string, any>,
    transaction?: any,
  ) {
    let query = `SELECT * FROM "${table}"`;
    const replacements: any = {};

    const whereClause = parseConditionForNamedParams(
      condition,
      replacements,
      params,
    );
    if (whereClause) {
      query += ` WHERE ${whereClause}`;
    }

    if (orderBy) {
      const orderStrings = Object.entries(orderBy).map(
        ([key, dir]) => `"${key}" ${dir}`,
      );
      query += ` ORDER BY ${orderStrings.join(', ')}`;
    }

    if (typeof limit === 'number') {
      query += ` LIMIT :limit`;
      replacements.limit = limit;
    }
    if (typeof offset === 'number') {
      query += ` OFFSET :offset`;
      replacements.offset = offset;
    }

    const result = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements,
      transaction,
    });

    return result;
  }
}
