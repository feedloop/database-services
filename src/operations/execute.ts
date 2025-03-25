import { Transaction } from 'sequelize';
import { DMLOperations } from '../types/dml';
import {
  SelectOperation,
  InsertOperation,
  UpdateOperation,
  DeleteOperation,
} from '../operations/dml';

export class DMLExecutor {
  static async execute(operations: DMLOperations[], transaction: Transaction) {
    const results: Record<string, any>[] = [];

    for (const { operation, instruction } of operations) {
      switch (operation) {
        case 'Select': {
          const selectResult = await SelectOperation.execute(
            instruction,
            transaction,
          );
          results.push(selectResult);
          break;
        }
        case 'Insert': {
          const insertResult = await InsertOperation.execute(
            instruction,
            transaction,
          );
          results.push(insertResult);
          break;
        }
        case 'Update': {
          const updateResult = await UpdateOperation.execute(
            instruction,
            transaction,
          );
          if (updateResult) {
            results.push(updateResult);
          }
          break;
        }
        case 'Delete': {
          const deleteResult = await DeleteOperation.execute(
            instruction,
            transaction,
          );
          results.push(deleteResult);
          break;
        }
        default: {
          throw new Error(`Unsupported operation: ${operation}`);
        }
      }
    }

    return results;
  }
}
