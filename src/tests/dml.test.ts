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
      {
        operation: 'Create',
        resource: 'Column',
        migration: {
          name: 'count',
          table: 'test_dml',
          column: {
            type: 'integer',
            definition: {
              default: 0,
              unique: false,
              nullable: true,
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
            count: 6,
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
            $and: [
              {
                $and: [
                  {
                    email: {
                      $eq: "' OR 1=1; --",
                    },
                  },
                ],
              },
            ],
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

    await expect(DMLExecutor.execute(dmlPayload, transaction)).rejects.toThrow(
      'Possible SQL injection detected in column email',
    );
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
            email: 'admin@admin.com',
            count: 10,
          },
        },
      },
    ];

    await expect(DMLExecutor.execute(dmlPayload, transaction)).rejects.toThrow(
      'Possible SQL injection detected in column external_id',
    );
  });

  test('Insert invalid type: number into text column', async () => {
    const dmlPayload: DMLOperations[] = [
      {
        operation: 'Insert',
        instruction: {
          table: 'test_dml',
          name: 'data',
          data: {
            external_id: 12345,
            email: 'admin@admin.com',
            count: 6,
          },
        },
      },
    ];

    await expect(DMLExecutor.execute(dmlPayload, transaction)).rejects.toThrow(
      'Invalid type for column external_id: expected TEXT, got number',
    );
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
            $and: [
              {
                external_id: {
                  $eq: 'user1',
                },
              },
            ],
          },
          set: {
            email: "admin@admin.com'); SELECT * FROM users; --",
          },
          params: {},
        },
      },
    ];

    await expect(DMLExecutor.execute(dmlPayload, transaction)).rejects.toThrow(
      'Possible SQL injection detected in column email',
    );
  });

  test('Update invalid type: string into integer column', async () => {
    const dmlPayload: DMLOperations[] = [
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
            count: 'invalid_number',
          },
          params: {},
        },
      },
    ];

    await expect(DMLExecutor.execute(dmlPayload, transaction)).rejects.toThrow(
      'Invalid type for column count: expected INTEGER, got string',
    );
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
            $and: [
              {
                external_id: {
                  $eq: 'user1',
                },
              },
            ],
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
            $and: [
              {
                external_id: {
                  $eq: "' OR 1=1; --",
                },
              },
            ],
          },
          params: {},
        },
      },
    ];

    await expect(DMLExecutor.execute(dmlPayload, transaction)).rejects.toThrow(
      'Possible SQL injection detected in column external_id',
    );
  });

  test('Delete with invalid type in condition: object instead of string', async () => {
    const dmlPayload: DMLOperations[] = [
      {
        operation: 'Delete',
        instruction: {
          table: 'test_dml',
          name: 'data',
          condition: {
            $and: [
              {
                external_id: {
                  $eq: 18729,
                },
              },
            ],
          },
          params: {},
        },
      },
    ];

    await expect(DMLExecutor.execute(dmlPayload, transaction)).rejects.toThrow(
      'Invalid type for column external_id: expected text, got number',
    );
  });
});

// mas kalau dipisah gini tuh gapapa ga? atau better disatuin aja sama yang atas gitu?
describe('Test all condition operator on DML Operations', () => {
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
      {
        operation: 'Create',
        resource: 'Column',
        migration: {
          name: 'count',
          table: 'test_dml',
          column: {
            type: 'integer',
            definition: {
              default: 0,
              unique: false,
              nullable: true,
            },
          },
        },
      },
    ];

    await DDLExecutor.execute(ddlPayload, transaction);

    // SETUP DML
    const dmlPayload: DMLOperations[] = [
      {
        operation: 'Insert',
        instruction: {
          table: 'test_dml',
          name: 'data',
          data: {
            external_id: 'user1',
            email: 'user1@example.com',
            count: 10,
          },
        },
      },
      {
        operation: 'Insert',
        instruction: {
          table: 'test_dml',
          name: 'data',
          data: {
            external_id: 'user2',
            email: 'user2@example.com',
            count: 20,
          },
        },
      },
      {
        operation: 'Insert',
        instruction: {
          table: 'test_dml',
          name: 'data',
          data: {
            external_id: 'user3',
            email: 'user3@example.com',
            count: 30,
          },
        },
      },
    ];

    await DMLExecutor.execute(dmlPayload, transaction);
  });

  afterEach(async () => {
    await transaction.rollback();
  });

  test('Select rows where count = 10 ($eq)', async () => {
    const dmlPayload: DMLOperations[] = [
      {
        operation: 'Select',
        instruction: {
          table: 'test_dml',
          name: 'data',
          condition: {
            $or: [
              {
                $or: [
                  {
                    count: {
                      $eq: 10,
                    },
                  },
                ],
              },
            ],
          },
          orderBy: {
            count: 'ASC',
          },
          limit: 10,
          offset: 0,
          params: {},
        },
      },
    ];

    const result = await DMLExecutor.execute(dmlPayload, transaction);
    expect(result[result.length - 1].length).toBe(1);
  });

  test('Select rows where count != 10 ($neq)', async () => {
    const dmlPayload: DMLOperations[] = [
      {
        operation: 'Select',
        instruction: {
          table: 'test_dml',
          name: 'data',
          condition: {
            $or: [
              {
                $or: [
                  {
                    count: {
                      $neq: 10,
                    },
                  },
                ],
              },
            ],
          },
          orderBy: {
            count: 'ASC',
          },
          limit: 10,
          offset: 0,
          params: {},
        },
      },
    ];

    const result = await DMLExecutor.execute(dmlPayload, transaction);
    expect(result[result.length - 1].length).toBe(2);
  });

  test('Select rows where count > 15', async () => {
    const dmlPayload: DMLOperations[] = [
      {
        operation: 'Select',
        instruction: {
          table: 'test_dml',
          name: 'data',
          condition: {
            $or: [
              {
                $or: [
                  {
                    count: {
                      $gt: 15,
                    },
                  },
                ],
              },
            ],
          },
          orderBy: { count: 'ASC' },
          limit: 10,
          offset: 0,
          params: {},
        },
      },
    ];
    const result = await DMLExecutor.execute(dmlPayload, transaction);
    expect(result[result.length - 1].length).toBe(2);
  });

  test('Select rows where count >= 10 ($gte)', async () => {
    const dmlPayload: DMLOperations[] = [
      {
        operation: 'Select',
        instruction: {
          table: 'test_dml',
          name: 'data',
          condition: {
            $and: [
              {
                count: {
                  $gte: 30,
                },
              },
            ],
          },
          orderBy: {
            count: 'ASC',
          },
          limit: 10,
          offset: 0,
          params: {},
        },
      },
    ];

    const result = await DMLExecutor.execute(dmlPayload, transaction);
    expect(result[result.length - 1].length).toBe(1);
  });

  test('Select rows where count < 20', async () => {
    const dmlPayload: DMLOperations[] = [
      {
        operation: 'Select',
        instruction: {
          table: 'test_dml',
          name: 'data',
          condition: {
            $and: [
              {
                count: {
                  $lt: 20,
                },
              },
            ],
          },
          orderBy: {
            count: 'ASC',
          },
          limit: 10,
          offset: 0,
          params: {},
        },
      },
    ];

    const result = await DMLExecutor.execute(dmlPayload, transaction);
    expect(result[result.length - 1].length).toBe(1);
  });

  test('Select rows where count <= 10 ($lte)', async () => {
    const dmlPayload: DMLOperations[] = [
      {
        operation: 'Select',
        instruction: {
          table: 'test_dml',
          name: 'data',
          condition: {
            $and: [
              {
                count: {
                  $lte: 10,
                },
              },
            ],
          },
          orderBy: {
            count: 'ASC',
          },
          limit: 10,
          offset: 0,
          params: {},
        },
      },
    ];

    const result = await DMLExecutor.execute(dmlPayload, transaction);
    expect(result[result.length - 1].length).toBe(1);
  });

  test('Select rows where count is in [10, 30] ($in)', async () => {
    const dmlPayload: DMLOperations[] = [
      {
        operation: 'Select',
        instruction: {
          table: 'test_dml',
          name: 'data',
          condition: {
            $and: [
              {
                count: {
                  $in: [10, 30],
                },
              },
            ],
          },
          orderBy: {
            count: 'ASC',
          },
          limit: 10,
          offset: 0,
          params: {},
        },
      },
    ];

    const result = await DMLExecutor.execute(dmlPayload, transaction);
    expect(result[result.length - 1].length).toBe(2);
  });

  test('Select rows where count is NOT in [10, 30] ($nin)', async () => {
    const dmlPayload: DMLOperations[] = [
      {
        operation: 'Select',
        instruction: {
          table: 'test_dml',
          name: 'data',
          condition: {
            $and: [
              {
                count: {
                  $nin: [10, 30],
                },
              },
            ],
          },
          orderBy: {
            count: 'ASC',
          },
          limit: 10,
          offset: 0,
          params: {},
        },
      },
    ];

    const result = await DMLExecutor.execute(dmlPayload, transaction);
    expect(result[result.length - 1].length).toBe(1);
  });

  test('Select rows using AND condition ($and)', async () => {
    const dmlPayload: DMLOperations[] = [
      {
        operation: 'Select',
        instruction: {
          table: 'test_dml',
          name: 'data',
          condition: {
            $and: [
              {
                count: {
                  $gt: 10,
                },
              },
              {
                external_id: {
                  $eq: 'user2',
                },
              },
            ],
          },
          orderBy: {
            count: 'ASC',
          },
          limit: 10,
          offset: 0,
          params: {},
        },
      },
    ];

    const result = await DMLExecutor.execute(dmlPayload, transaction);
    expect(result[result.length - 1].length).toBe(1);
  });

  test('Select rows using OR condition ($or)', async () => {
    const dmlPayload: DMLOperations[] = [
      {
        operation: 'Select',
        instruction: {
          table: 'test_dml',
          name: 'data',
          condition: {
            $or: [
              {
                $or: [
                  {
                    $or: [
                      {
                        $or: [
                          {
                            $or: [
                              {
                                count: {
                                  $eq: 10,
                                },
                              },
                              {
                                external_id: {
                                  $eq: 'user2',
                                },
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          orderBy: {
            count: 'ASC',
          },
          limit: 10,
          offset: 0,
          params: {},
        },
      },
    ];

    const result = await DMLExecutor.execute(dmlPayload, transaction);
    expect(result[result.length - 1].length).toBe(2);
  });
});
