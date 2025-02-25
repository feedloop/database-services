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

describe('DDL Operations - Table and Column Manipulation', () => {
  const testTable = 'test_table';
  const testColumn = 'test_column';

  beforeEach(async () => {
    transaction = await sequelize.transaction();
  });

  afterEach(async () => {
    await transaction.rollback();
  });

  test('Create Table', async () => {
    await CreateTable.execute(testTable, { type: 'UUID' }, transaction);

    const [results]: any = await sequelize.query(
      `SELECT table_name FROM information_schema.tables WHERE table_name = '${testTable}';`,
      { transaction },
    );
    expect(results.length).toBe(1);
  });

  test('Alter Table', async () => {
    await CreateTable.execute(testTable, { type: 'UUID' }, transaction);
    const newTableName = 'renamed_table';
    await AlterTable.execute(testTable, newTableName, transaction);

    const [results]: any = await sequelize.query(
      `SELECT table_name FROM information_schema.tables WHERE table_name = '${newTableName}';`,
      { transaction },
    );
    expect(results.length).toBe(1);
  });

  test('Create Column', async () => {
    await CreateTable.execute('renamed_table', { type: 'UUID' }, transaction);
    await CreateColumn.execute(
      'renamed_table',
      { name: testColumn, column: { type: 'text' } },
      transaction,
    );

    const [results]: any = await sequelize.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'renamed_table' AND column_name = '${testColumn}';`,
      { transaction },
    );
    expect(results.length).toBe(1);
  });

  test('Alter Column', async () => {
    await CreateTable.execute('renamed_table', { type: 'UUID' }, transaction);
    await CreateColumn.execute(
      'renamed_table',
      { name: testColumn, column: { type: 'text' } },
      transaction,
    );
    await AlterColumn.execute(
      'renamed_table',
      testColumn,
      'updated_column',
      { nullable: false },
      transaction,
    );

    const [results]: any = await sequelize.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'renamed_table' AND column_name = 'updated_column';`,
      { transaction },
    );
    expect(results.length).toBe(1);
  });

  test('Drop Column', async () => {
    await CreateTable.execute('renamed_table', { type: 'UUID' }, transaction);
    await CreateColumn.execute(
      'renamed_table',
      { name: testColumn, column: { type: 'text' } },
      transaction,
    );
    await AlterColumn.execute(
      'renamed_table',
      testColumn,
      'updated_column',
      { nullable: false },
      transaction,
    );

    await DropColumn.execute('renamed_table', 'updated_column', transaction);

    const [results]: any = await sequelize.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'renamed_table' AND column_name = 'updated_column';`,
      { transaction },
    );
    expect(results.length).toBe(0);
  });

  test('Drop Table', async () => {
    await CreateTable.execute('renamed_table', { type: 'UUID' }, transaction);
    await DropTable.execute('renamed_table', transaction);

    const [results] = await sequelize.query(
      `SELECT table_name FROM information_schema.tables WHERE table_name = 'renamed_table';`,
      { transaction },
    );
    console.log('Drop Table Query Result:', results);

    expect(Array.isArray(results) ? results.length : 0).toBe(0);
  });
});
