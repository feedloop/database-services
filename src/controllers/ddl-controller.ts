import { Request, Response } from 'express';
import { sequelize } from '../config/database';
import { successResponse, errorResponse } from '../utils/response';
import {
  CreateTable,
  CreateColumn,
  AlterColumn,
  DropColumn,
  DropTable,
} from '../operations/ddl';

interface Operation {
  operation: 'Create' | 'Alter' | 'Drop';
  resource: 'Table' | 'Column';
  migration: MigrationDetails;
}

interface MigrationDetails {
  name?: string;
  table?: string;
  column?: string;
  from?: string;
  to?: string;
  columnDefinition?: ColumnDefinition;
}

interface ColumnDefinition {
  type: string;
  nullable?: boolean;
  unique?: boolean;
  default?: any;
  primary?: boolean;
}

export const migrate = async (req: Request, res: Response) => {
  const { operations }: { operations: Operation[] } = req.body;
  if (!operations || !Array.isArray(operations))
    return errorResponse(res, 'Invalid payload structure', 400);

  const transaction = await sequelize.transaction();

  try {
    for (const { operation, resource, migration } of operations) {
      const { name, table, column, from, to, columnDefinition } = migration;

      switch (`${operation}-${resource}`) {
        case 'Create-Table':
          await CreateTable.execute(name!, columnDefinition, transaction);
          break;
        case 'Create-Column':
          await CreateColumn.execute(table!, migration!, transaction);
          break;
        case 'Alter-Column':
          await AlterColumn.execute(
            table!,
            from!,
            to!,
            columnDefinition,
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
