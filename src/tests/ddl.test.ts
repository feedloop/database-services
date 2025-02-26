import { sequelize } from '../config/database';
import { Transaction } from 'sequelize';
import {
  CreateTable,
  CreateColumn,
  AlterTable,
  AlterColumn,
  DropColumn,
  DropTable,
} from '../operations/ddl';

let transaction: Transaction;

beforeAll(async () => {
  await sequelize.authenticate();
});

afterAll(async () => {
  await sequelize.close();
});

describe('DDL Operations', () => {
  beforeEach(async () => {
    transaction = await sequelize.transaction();
  });

  afterEach(async () => {
    await transaction.rollback();
  });

  async function executeDDLFromPayload(
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

  // ini maksudnya 1 kali aja jadi gini atau tetep test nya mah dibikin per operation?
  test('Execute DDL Operations from Payload', async () => {
    const payload = [
      {
        operation: 'Create',
        resource: 'Table',
        migration: {
          name: 'test',
          primaryKey: 'UUID',
        },
      },
      {
        operation: 'Create',
        resource: 'Column',
        migration: {
          name: 'name',
          table: 'test',
          column: {
            type: 'text',
            definition: {
              textType: 'text',
              default: null,
              unique: false,
              nullable: true,
            },
          },
        },
      },
      {
        operation: 'Alter',
        resource: 'Table',
        migration: {
          from: 'test',
          to: 'updated_table',
        },
      },
      {
        operation: 'Alter',
        resource: 'Column',
        migration: {
          from: 'name',
          to: 'updated_name',
          table: 'updated_table',
          description: '',
          column: {
            definition: {
              unique: true,
              default: true,
              nullable: false,
            },
          },
        },
      },
      {
        operation: 'Drop',
        resource: 'Column',
        migration: {
          table: 'updated_table',
          column: 'updated_name',
        },
      },
      {
        operation: 'Drop',
        resource: 'Table',
        migration: {
          name: 'updated_table',
        },
      },
    ];

    await executeDDLFromPayload(payload, transaction);

    const [results]: any = await sequelize.query(
      `SELECT table_name FROM information_schema.tables WHERE table_name = 'updated_table';`,
      { transaction },
    );

    expect(results?.length ?? 0).toBe(0);
  });
});
