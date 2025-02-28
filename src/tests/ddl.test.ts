import { sequelize } from '../config/database';
import { Transaction } from 'sequelize';
import { DDLExecutor } from '../operations/migrate';
import { Operations } from '../types/ddl';
import MetadataTableRepository from '../repositories/metadata-table-repository';

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

  test('Execute a sequence of DDL operations successfully', async () => {
    const payload: Operations[] = [
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

    await DDLExecutor.execute(payload, transaction);

    const [tableResults]: any = await sequelize.query(
      `SELECT table_name FROM information_schema.tables WHERE table_name = 'updated_table';`,
      { transaction },
    );
    expect(tableResults?.length ?? 0).toBe(0);

    const metadataTableResults = await MetadataTableRepository.findOne(
      {
        table_name: 'updated_table',
      },
      transaction,
    );
    expect(metadataTableResults).toBeNull();
  });

  // CREATE TABLE TESTS
  test('Fail creating a table with an existing name', async () => {
    const payload: Operations[] = [
      {
        operation: 'Create',
        resource: 'Table',
        migration: {
          name: 'duplicate_table',
          primaryKey: 'UUID',
        },
      },
      {
        operation: 'Create',
        resource: 'Table',
        migration: {
          name: 'duplicate_table',
          primaryKey: 'UUID',
        },
      },
    ];

    await expect(DDLExecutor.execute(payload, transaction)).rejects.toThrow(
      'Table duplicate_table already exists',
    );
  });

  test('Create a table and verify its existence in metadata', async () => {
    const payload: Operations[] = [
      {
        operation: 'Create',
        resource: 'Table',
        migration: {
          name: 'metadata_test_table',
          primaryKey: 'UUID',
        },
      },
    ];

    await DDLExecutor.execute(payload, transaction);

    const metadataTableResults = await MetadataTableRepository.findOne(
      {
        table_name: 'metadata_test_table',
      },
      transaction,
    );
    expect(metadataTableResults).not.toBeNull();
  });

  test('Prevent SQL Injection in table name', async () => {
    const payload: Operations[] = [
      {
        operation: 'Create',
        resource: 'Table',
        migration: {
          name: 'users; DROP TABLE metadata_table; --',
          primaryKey: 'UUID',
        },
      },
    ];

    await expect(DDLExecutor.execute(payload, transaction)).rejects.toThrow(
      'Invalid table name: users; DROP TABLE metadata_table; --',
    );
  });

  test('Prevent invalid characters in table name', async () => {
    const payload: Operations[] = [
      {
        operation: 'Create',
        resource: 'Table',
        migration: {
          name: 'invalid@table!',
          primaryKey: 'UUID',
        },
      },
    ];

    await expect(DDLExecutor.execute(payload, transaction)).rejects.toThrow(
      'Invalid table name: invalid@table!',
    );
  });

  // CREATE COLUMN TESTS
  test('Fail creating a column that already exists', async () => {
    const payload: Operations[] = [
      {
        operation: 'Create',
        resource: 'Table',
        migration: { name: 'column_test', primaryKey: 'UUID' },
      },
      {
        operation: 'Create',
        resource: 'Column',
        migration: {
          name: 'duplicate_column',
          table: 'column_test',
          column: {
            type: 'text',
            definition: { unique: false, default: null, nullable: true },
          },
        },
      },
      {
        operation: 'Create',
        resource: 'Column',
        migration: {
          name: 'duplicate_column',
          table: 'column_test',
          column: {
            type: 'text',
            definition: { unique: false, default: null, nullable: true },
          },
        },
      },
    ];

    await expect(DDLExecutor.execute(payload, transaction)).rejects.toThrow(
      'Column "duplicate_column" already exists in "column_test"',
    );
  });

  test('Fail creating a column in a non-existent table', async () => {
    const payload: Operations[] = [
      {
        operation: 'Create',
        resource: 'Column',
        migration: {
          name: 'invalid_column',
          table: 'non_existent_table',
          column: {
            type: 'text',
            definition: {
              unique: false,
              default: null,
              nullable: true,
            },
          },
        },
      },
    ];

    await expect(DDLExecutor.execute(payload, transaction)).rejects.toThrow(
      'Table non_existent_table does not exist',
    );
  });

  test('Prevent invalid characters in column name', async () => {
    const payload: Operations[] = [
      {
        operation: 'Create',
        resource: 'Column',
        migration: {
          name: 'invalid@name!',
          table: 'test',
          column: {
            type: 'text',
            definition: { unique: false, default: null, nullable: true },
          },
        },
      },
    ];

    await expect(DDLExecutor.execute(payload, transaction)).rejects.toThrow(
      'Invalid table or column name',
    );
  });

  test('Prevent SQL Injection in column name', async () => {
    const payload: Operations[] = [
      {
        operation: 'Create',
        resource: 'Column',
        migration: {
          name: 'name"; DROP TABLE users; --',
          table: 'test_injection',
          column: {
            type: 'text',
            definition: { unique: false, default: null, nullable: true },
          },
        },
      },
    ];

    await expect(DDLExecutor.execute(payload, transaction)).rejects.toThrow(
      'Invalid table or column name',
    );
  });

  // ALTER TABLE TESTS
  test('Fail renaming a table if target name already exists', async () => {
    const payload: Operations[] = [
      {
        operation: 'Create',
        resource: 'Table',
        migration: {
          name: 'table1',
          primaryKey: 'UUID',
        },
      },
      {
        operation: 'Create',
        resource: 'Table',
        migration: {
          name: 'table2',
          primaryKey: 'UUID',
        },
      },
      {
        operation: 'Alter',
        resource: 'Table',
        migration: {
          from: 'table1',
          to: 'table2',
        },
      },
    ];

    await expect(DDLExecutor.execute(payload, transaction)).rejects.toThrow(
      'Table "table2" already exists',
    );
  });

  test('Fail renaming a non-existent table', async () => {
    const payload: Operations[] = [
      {
        operation: 'Alter',
        resource: 'Table',
        migration: {
          from: 'non_existent_table',
          to: 'new_table',
        },
      },
    ];

    await expect(DDLExecutor.execute(payload, transaction)).rejects.toThrow(
      'Table "non_existent_table" does not exist',
    );
  });

  // ALTER COLUMN TESTS
  test('Fail renaming a column that does not exist', async () => {
    const payload: Operations[] = [
      {
        operation: 'Create',
        resource: 'Table',
        migration: { name: 'test_table', primaryKey: 'UUID' },
      },
      {
        operation: 'Alter',
        resource: 'Column',
        migration: {
          from: 'non_existent_column',
          to: 'new_column',
          table: 'test_table',
          column: {
            definition: {
              unique: true,
              default: true,
              nullable: false,
            },
          },
        },
      },
    ];

    await expect(DDLExecutor.execute(payload, transaction)).rejects.toThrow(
      'Column non_existent_column does not exist',
    );
  });

  test('Fail renaming a column if target name already exists', async () => {
    const payload: Operations[] = [
      {
        operation: 'Create',
        resource: 'Table',
        migration: { name: 'rename_test', primaryKey: 'UUID' },
      },
      {
        operation: 'Create',
        resource: 'Column',
        migration: {
          name: 'existing_column',
          table: 'rename_test',
          column: {
            type: 'text',
            definition: { unique: false, default: null, nullable: true },
          },
        },
      },
      {
        operation: 'Create',
        resource: 'Column',
        migration: {
          name: 'new_column',
          table: 'rename_test',
          column: {
            type: 'text',
            definition: { unique: false, default: null, nullable: true },
          },
        },
      },
      {
        operation: 'Alter',
        resource: 'Column',
        migration: {
          from: 'existing_column',
          to: 'new_column',
          table: 'rename_test',
          column: {
            definition: { unique: false, default: null, nullable: true },
          },
        },
      },
    ];

    await expect(DDLExecutor.execute(payload, transaction)).rejects.toThrow(
      'Column new_column already exist',
    );
  });

  // DROP TABLE TESTS
  test('Fail dropping a table that does not exist', async () => {
    const payload: Operations[] = [
      {
        operation: 'Drop',
        resource: 'Table',
        migration: {
          name: 'non_existent_table',
        },
      },
    ];

    await expect(DDLExecutor.execute(payload, transaction)).rejects.toThrow(
      'Table non_existent_table does not exist',
    );
  });

  // DROP COLUMN TESTS
  test('Fail dropping a column that does not exist', async () => {
    const payload: Operations[] = [
      {
        operation: 'Create',
        resource: 'Table',
        migration: { name: 'test', primaryKey: 'UUID' },
      },
      {
        operation: 'Drop',
        resource: 'Column',
        migration: { table: 'test', column: 'non_existent_column' },
      },
    ];

    await expect(DDLExecutor.execute(payload, transaction)).rejects.toThrow(
      'Column non_existent_column does not exist in table test',
    );
  });
});
