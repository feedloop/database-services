import { Request, Response } from 'express';
import { errorResponse, successResponse } from '../utils/response';
import { QueryExecutor } from '../operations/query';

export const executeQuery = async (req: Request, res: Response) => {
  try {
    const { query } = req.body;

    const result = await QueryExecutor.execute(query);
    return successResponse(res, result, 'Query executed successfully');
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Failed to execute query', 500);
  }
};
