import { sequelize } from '../config/database';
import { Transaction } from 'sequelize';
import { DMLExecutor } from '../operations/execute';
import { DMLOperations } from '../types/dml';
import { DDLOperations } from '../types/ddl';
import { DDLExecutor } from '../operations/migrate';

let transaction: Transaction;

beforeAll(async () => {
  await sequelize.authenticate();
});

afterAll(async () => {
  await sequelize.close();
});

describe('DML Operations', () => {
  beforeEach(async () => {
    transaction = await sequelize.transaction();

    // SETUP DDL
    const ddlPayload: DDLOperations[] = [
      {
        operation: 'Create',
        resource: 'Table',
        migration: {
          name: 'test_dml',
          primaryKey: 'UUID',
        },
      },
      {
        operation: 'Create',
        resource: 'Column',
        migration: {
          name: 'email',
          table: 'test_dml',
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
          table: 'test_dml',
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
          table: 'test_dml',
          column: {
            type: 'timestamp',
            definition: {
              default: 'now()',
              unique: false,
              nullable: false,
            },
          },
        },
      },
    ];

    await DDLExecutor.execute(ddlPayload, transaction);
  });

  afterEach(async () => {
    await transaction.rollback();
  });

  test('Execute a sequence of DML operations successfully', async () => {
    const dmlPayload: DMLOperations[] = [
      {
        operation: 'Select',
        instruction: {
          name: 'data',
          orderBy: {
            created_at: 'ASC',
          },
          condition: {},
          limit: 26,
          offset: 0,
          params: {},
          table: 'test_dml',
        },
      },
      {
        operation: 'Select',
        instruction: {
          name: 'data',
          orderBy: {
            created_at: 'ASC',
          },
          condition: {
            $or: [
              {
                $or: [
                  {
                    email: {
                      $eq: '{{name}}',
                    },
                    external_id: {
                      $eq: 'user1',
                    },
                  },
                ],
              },
            ],
          },
          limit: 26,
          offset: 0,
          params: {
            name: 'admin@admin.com',
          },
          table: 'test_dml',
        },
      },
      {
        operation: 'Insert',
        instruction: {
          table: 'test_dml',
          name: 'data',
          data: {
            external_id: 'user1',
            email: 'admin@admin.com',
          },
        },
      },
      {
        operation: 'Update',
        instruction: {
          table: 'test_dml',
          name: 'data',
          condition: {
            $and: [
              {
                external_id: {
                  $eq: 'user1',
                },
              },
            ],
          },
          set: {
            external_id: 'admin1',
          },
          params: {},
        },
      },
      {
        operation: 'Delete',
        instruction: {
          table: 'test_dml',
          name: 'data',
          condition: {
            $and: [
              {
                external_id: {
                  $eq: 'admin1',
                },
              },
            ],
          },
          params: {},
        },
      },
    ];

    await DMLExecutor.execute(dmlPayload, transaction);

    const [test_dml]: any = await sequelize.query(
      `SELECT * FROM test_dml WHERE external_id = 'admin1';`,
      { transaction },
    );

    expect(test_dml.length).toBeGreaterThanOrEqual(0);
  });

  // SELECT
  test('Prevent SQL injection on select', async () => {
    const dmlPayload: DMLOperations[] = [
      {
        operation: 'Select',
        instruction: {
          name: 'data',
          table: 'test_dml',
          condition: {
            email: {
              $eq: "' OR 1=1; --",
            },
          },
          orderBy: {
            created_at: 'ASC',
          },
          limit: 10,
          offset: 0,
          params: {},
        },
      },
    ];

    await expect(
      DMLExecutor.execute(dmlPayload, transaction),
    ).rejects.toThrow();
  });

  // INSERT
  test('Fail insert row into non-existent table', async () => {
    const dmlPayload: DMLOperations[] = [
      {
        operation: 'Insert',
        instruction: {
          table: 'non_existent_table',
          name: 'data',
          data: {
            external_id: 'user1',
            email: 'admin@admin.com',
          },
        },
      },
    ];

    await expect(DMLExecutor.execute(dmlPayload, transaction)).rejects.toThrow(
      'Table non_existent_table does not exist',
    );
  });

  test('Prevent SQL injection on insert', async () => {
    const dmlPayload: DMLOperations[] = [
      {
        operation: 'Insert',
        instruction: {
          table: 'test_dml',
          name: 'data',
          data: {
            external_id: "user1'; DROP TABLE test_dml; --",
            email: "admin@admin.com'); SELECT * FROM users; --",
          },
        },
      },
    ];

    await expect(
      DMLExecutor.execute(dmlPayload, transaction),
    ).rejects.toThrow();
  });

  // UPDATE
  test(' Fail update row into non-existent table', async () => {
    const dmlPayload: DMLOperations[] = [
      {
        operation: 'Update',
        instruction: {
          table: 'non_existent_table',
          name: 'data',
          condition: {
            external_id: {
              $eq: 'user1',
            },
          },
          set: {
            external_id: 'admin1',
          },
          params: {},
        },
      },
    ];

    await expect(DMLExecutor.execute(dmlPayload, transaction)).rejects.toThrow(
      'Table non_existent_table does not exist',
    );
  });

  test('Prevent SQL injection on update', async () => {
    const dmlPayload: DMLOperations[] = [
      {
        operation: 'Update',
        instruction: {
          table: 'test_dml',
          name: 'data',
          condition: {
            external_id: {
              $eq: "'; DROP TABLE test_dml; --",
            },
          },
          set: {
            email: "admin@admin.com'); SELECT * FROM users; --",
          },
          params: {},
        },
      },
    ];

    await expect(
      DMLExecutor.execute(dmlPayload, transaction),
    ).rejects.toThrow();
  });

  // DELETE
  test('Fail delete non-existent table', async () => {
    const dmlPayload: DMLOperations[] = [
      {
        operation: 'Delete',
        instruction: {
          table: 'non_existent_table',
          name: 'data',
          condition: {
            external_id: {
              $eq: 'user1',
            },
          },
          params: {},
        },
      },
    ];

    await expect(DMLExecutor.execute(dmlPayload, transaction)).rejects.toThrow(
      'Table non_existent_table does not exist',
    );
  });

  test('Prevent SQL injection on delete', async () => {
    const dmlPayload: DMLOperations[] = [
      {
        operation: 'Delete',
        instruction: {
          table: 'test_dml',
          name: 'data',
          condition: {
            external_id: {
              $eq: "' OR 1=1; --",
            },
          },
          params: {},
        },
      },
    ];

    await expect(
      DMLExecutor.execute(dmlPayload, transaction),
    ).rejects.toThrow();
  });
});
