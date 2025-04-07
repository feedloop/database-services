import { sequelize } from '../config/database';
import { QueryTypes } from 'sequelize';

export class QueryExecutor {
  static async execute(query: string) {
    if (!query || typeof query !== 'string') {
      throw new Error('Query is required and must be a string');
    }

    const forbiddenPatterns = [
      /DROP\s+TABLE/i,
      /ALTER\s+/i,
      /DELETE\s+FROM\s+[^\s]+(\s*;|$)/i,
    ];
    if (forbiddenPatterns.some((pattern) => pattern.test(query))) {
      throw new Error('Query contains forbidden operations');
    }

    const result = await sequelize.query(query, { type: QueryTypes.RAW });
    return result;
  }
}
