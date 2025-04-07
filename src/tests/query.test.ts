import { sequelize } from '../config/database';
import { Transaction } from 'sequelize';
import { DDLExecutor } from '../operations/migrate';
import { DDLOperations } from '../types/ddl';
import { QueryExecutor } from '../operations/query';
import MetadataTableRepository from '../repositories/metadata-table-repository';

let transaction: Transaction;

beforeAll(async () => {
  await sequelize.authenticate();

  const ddlTransaction = await sequelize.transaction();

  try {
    const ddlPayload: DDLOperations[] = [
      {
        operation: 'Create',
        resource: 'Table',
        migration: { name: 'test_query', primaryKey: 'UUID' },
      },
      {
        operation: 'Create',
        resource: 'Column',
        migration: {
          name: 'email',
          table: 'test_query',
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
        operation: 'Create',
        resource: 'Column',
        migration: {
          name: 'external_id',
          table: 'test_query',
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
        operation: 'Create',
        resource: 'Column',
        migration: {
          name: 'created_at',
          table: 'test_query',
          column: {
            type: 'timestamp',
            definition: { default: 'now()', unique: false, nullable: false },
          },
        },
      },
      {
        operation: 'Create',
        resource: 'Column',
        migration: {
          name: 'count',
          table: 'test_query',
          column: {
            type: 'integer',
            definition: { default: 0, unique: false, nullable: true },
          },
        },
      },
    ];

    await DDLExecutor.execute(ddlPayload, ddlTransaction);
    await ddlTransaction.commit();
  } catch (error) {
    await ddlTransaction.rollback();
    throw error;
  }
});

afterAll(async () => {
  await MetadataTableRepository.delete({ table_name: 'test_query' });
  await sequelize.query('DROP TABLE IF EXISTS test_query CASCADE;');
  await sequelize.close();
});

describe('SQL Query Execution', () => {
  beforeEach(async () => {
    transaction = await sequelize.transaction();
  });

  afterEach(async () => {
    await transaction.rollback();
  });

  test('Execute a sequence of queries (INSERT, SELECT, UPDATE, DELETE) successfully', async () => {
    const query = `
      INSERT INTO test_query (email, external_id, count) VALUES ('user1@example.com', 'user1', 5);
      INSERT INTO test_query (email, external_id, count) VALUES ('user2@example.com', 'user2', 10);
      UPDATE test_query SET count = 15 WHERE email = 'user1@example.com';
      DELETE FROM test_query WHERE email = 'user2@example.com';
      SELECT * FROM test_query;
    `;

    const result = await QueryExecutor.execute(query);
    console.log('Final query result:', result);

    const selectResult = result[0];

    expect(Array.isArray(selectResult)).toBe(true);
    expect(selectResult.length).toBe(1);
    expect(selectResult[0]).toMatchObject({
      email: 'user1@example.com',
      external_id: 'user1',
      count: 15,
    });
  });

  test('Fail to insert NULL into a NOT NULL column', async () => {
    const query = `INSERT INTO test_query (email, external_id, count) VALUES ('user1@example.com', NULL, 20);`;
    await expect(QueryExecutor.execute(query)).rejects.toThrow();
  });

  test('Fail due to invalid SQL syntax', async () => {
    const query = `SELEC * FROM test_query;`;
    await expect(QueryExecutor.execute(query)).rejects.toThrow();
  });

  test('Fail: DROP TABLE should be rejected', async () => {
    const query = `DROP TABLE test_query;`;
    await expect(QueryExecutor.execute(query)).rejects.toThrow(
      /Query contains forbidden operations/i,
    );
  });

  test('Fail: ALTER TABLE DROP COLUMN should be rejected', async () => {
    const query = `ALTER TABLE test_query DROP COLUMN email;`;
    await expect(QueryExecutor.execute(query)).rejects.toThrow(
      /Query contains forbidden operations/i,
    );
  });

  test('Fail: DELETE without WHERE should be rejected', async () => {
    const query = `DELETE FROM test_query;`;
    await expect(QueryExecutor.execute(query)).rejects.toThrow(
      /Query contains forbidden operations/i,
    );
  });

  test('Fail: Invalid SQL syntax should be rejected', async () => {
    const query = `THIS IS NOT A VALID SQL STATEMENT`;
    await expect(QueryExecutor.execute(query)).rejects.toThrow(/syntax error/i);
  });
});
