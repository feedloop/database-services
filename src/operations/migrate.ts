import { Transaction } from 'sequelize';
import { ColumnObject, DDLOperations } from '../types/ddl';
import {
  CreateTable,
  CreateColumn,
  AlterTable,
  AlterColumn,
  DropColumn,
  DropTable,
} from '../operations/ddl';

export class DDLExecutor {
  static async execute(operations: DDLOperations[], transaction: Transaction) {
    for (const { operation, resource, migration } of operations) {
      const { name, table, column, from, to } = migration;

      let columnName: string;
      let finalColumnDefinition = {};

      if (typeof column === 'string') {
        columnName = column;
      } else if (typeof column === 'object' && 'definition' in column) {
        finalColumnDefinition = (column as ColumnObject).definition ?? {};
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
          await DropColumn.execute(table!, columnName!, transaction);
          break;
        case 'Drop-Table':
          await DropTable.execute(name!, transaction);
          break;
        default:
          throw new Error(`Unsupported operation: ${operation} on ${resource}`);
      }
    }
  }
}
