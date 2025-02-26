import { sequelize } from '../config/database';
import { Transaction } from 'sequelize';
import { executeDDLFromPayload } from '../operations/migrate';

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
