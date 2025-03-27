import { Request, Response } from 'express';
import SchemaRepository from '../repositories/schema-repository';
import { errorResponse, successResponse } from '../utils/response';

export const schema = async (req: Request, res: Response) => {
  try {
    const tables = await SchemaRepository.getSchemas();

    return successResponse(res, tables);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(res, errorMessage, 500);
  }
};
