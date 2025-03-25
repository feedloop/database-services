import { Request, Response } from 'express';
import { sequelize } from '../config/database';
import { QueryTypes } from 'sequelize';
import { errorResponse, successResponse } from '../utils/response';

export const executeQuery = async (req: Request, res: Response) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return errorResponse(res, 'Query is required and must be a string', 400);
    }

    const forbiddenPatterns = [
      /DROP\s+TABLE/i,
      /ALTER\s+/i,
      /DELETE\s+FROM\s+[^\s]+(\s*;|$)/i,
    ];
    if (forbiddenPatterns.some((pattern) => pattern.test(query))) {
      return errorResponse(res, 'Query contains forbidden operations', 403);
    }

    const queryType = query.trim().toUpperCase().startsWith('SELECT')
      ? QueryTypes.SELECT
      : QueryTypes.RAW;

    const result = await sequelize.query(query, { type: queryType });
    return successResponse(res, result, 'Query executed successfully');
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Failed to execute query', 500);
  }
};
