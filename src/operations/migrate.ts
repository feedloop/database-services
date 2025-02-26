import { Transaction } from 'sequelize';
import {
  CreateTable,
  CreateColumn,
  AlterTable,
  AlterColumn,
  DropColumn,
  DropTable,
} from '../operations/ddl';

export async function executeDDLFromPayload(
  operations: any[],
  transaction: Transaction,
) {
  for (const op of operations) {
    switch (op.operation) {
      case 'Create':
        if (op.resource === 'Table') {
          await CreateTable.execute(
            op.migration.name,
            { type: op.migration.primaryKey },
            transaction,
          );
        } else if (op.resource === 'Column') {
          await CreateColumn.execute(
            op.migration.table,
            { name: op.migration.name, column: op.migration.column },
            transaction,
          );
        }
        break;
      case 'Alter':
        if (op.resource === 'Table') {
          await AlterTable.execute(
            op.migration.from,
            op.migration.to,
            transaction,
          );
        } else if (op.resource === 'Column') {
          await AlterColumn.execute(
            op.migration.table,
            op.migration.from,
            op.migration.to,
            op.migration.column?.definition || {},
            transaction,
          );
        }
        break;
      case 'Drop':
        if (op.resource === 'Table') {
          await DropTable.execute(op.migration.name, transaction);
        } else if (op.resource === 'Column') {
          await DropColumn.execute(
            op.migration.table,
            op.migration.column,
            transaction,
          );
        }
        break;
    }
  }
}
