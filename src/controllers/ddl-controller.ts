import { Request, Response } from 'express';
import { sequelize } from '../config/database';
import { successResponse, errorResponse } from '../utils/response';
import { Operations } from '../types/ddl';
import {
  CreateTable,
  CreateColumn,
  AlterTable,
  AlterColumn,
  DropColumn,
  DropTable,
} from '../operations/ddl';

export const migrate = async (req: Request, res: Response) => {
  const { operations }: { operations: Operations[] } = req.body;
  if (!operations || !Array.isArray(operations))
    return errorResponse(res, 'Invalid payload structure', 400);

  const transaction = await sequelize.transaction();

  try {
    for (const { operation, resource, migration } of operations) {
      const { name, table, column, from, to } = migration;

      let finalColumnDefinition = {};
      if (column && typeof column === 'object' && 'definition' in column) {
        finalColumnDefinition = (column as any).definition;
      }

      switch (`${operation}-${resource}`) {
        case 'Create-Table':
          await CreateTable.execute(name!, migration!, transaction);
          break;
        case 'Create-Column':
          await CreateColumn.execute(table!, migration!, transaction);
          break;
        case 'Alter-Table':
          await AlterTable.execute(from!, to!, transaction);
          break;
        case 'Alter-Column':
          await AlterColumn.execute(
            table!,
            from!,
            to!,
            finalColumnDefinition,
            transaction,
          );
          break;
        case 'Drop-Column':
          await DropColumn.execute(table!, column!, transaction);
          break;
        case 'Drop-Table':
          await DropTable.execute(name!, transaction);
          break;
        default:
          throw new Error(`Unsupported operation: ${operation} on ${resource}`);
      }
    }

    await transaction.commit();
    return successResponse(res, {}, 'DDL operations completed successfully');
  } catch (error: any) {
    await transaction.rollback();
    return errorResponse(res, error.message, 500);
  }
};
