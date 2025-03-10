import { Request, Response } from 'express';
import { sequelize } from '../config/database';
import { successResponse, errorResponse } from '../utils/response';
import { DMLOperations } from '../types/dml';
import { DMLExecutor } from '../operations/execute';

export const execute = async (req: Request, res: Response) => {
  const { operations }: { operations: DMLOperations[] } = req.body;
  if (!operations || !Array.isArray(operations))
    return errorResponse(res, 'Invalid payload structure', 400);

  const transaction = await sequelize.transaction();

  try {
    const result = await DMLExecutor.execute(operations, transaction);
    await transaction.commit();
    return successResponse(
      res,
      result,
      'DML operations completed successfully',
    );
  } catch (error: any) {
    await transaction.rollback();
    return errorResponse(res, error.message, 500);
  }
};
