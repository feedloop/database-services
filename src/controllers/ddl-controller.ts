import { Request, Response } from 'express';
import { sequelize } from '../config/database';
import { successResponse, errorResponse } from '../utils/response';
import { DDLOperations } from '../types/ddl';
import { DDLExecutor } from '../operations/migrate';

export const migrate = async (req: Request, res: Response) => {
  const { operations }: { operations: DDLOperations[] } = req.body;
  if (!operations || !Array.isArray(operations))
    return errorResponse(res, 'Invalid payload structure', 400);

  const transaction = await sequelize.transaction();

  try {
    await DDLExecutor.execute(operations, transaction);

    await transaction.commit();
    return successResponse(res, {}, 'DDL operations completed successfully');
  } catch (error: any) {
    await transaction.rollback();
    return errorResponse(res, error.message, 500);
  }
};
