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
          await InsertOperation.execute(instruction, transaction);
          break;
        }
        case 'Update': {
          await UpdateOperation.execute(instruction, transaction);
          break;
        }
        case 'Delete': {
          await DeleteOperation.execute(instruction, transaction);
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
