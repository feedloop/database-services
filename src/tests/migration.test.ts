import { sequelize } from '../config/database';
import { Transaction } from 'sequelize';
import {
  CreateTable,
  AlterTable,
  CreateColumn,
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

describe('Migration Operations', () => {
  const originalTable = 'migrate_table';
  const renamedTable = 'migrated_table';
  const initialColumn = 'initial_column';
  const updatedColumn = 'updated_column';

  beforeEach(async () => {
    transaction = await sequelize.transaction();
  });

  afterEach(async () => {
    await transaction.rollback();
  });

  test('Full Migration Flow', async () => {
    await CreateTable.execute(originalTable, { type: 'UUID' }, transaction);
    let [tableResults]: any = await sequelize.query(
      `SELECT table_name FROM information_schema.tables WHERE table_name = '${originalTable}';`,
      { transaction },
    );
    expect(Array.isArray(tableResults) ? tableResults.length : 0).toBe(1);

    await CreateColumn.execute(
      originalTable,
      {
        name: initialColumn,
        column: { type: 'VARCHAR(255)', nullable: false },
      },
      transaction,
    );
    let [columnResults]: any = await sequelize.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = '${originalTable}' AND column_name = '${initialColumn}';`,
      { transaction },
    );
    expect(Array.isArray(columnResults) ? columnResults.length : 0).toBe(1);

    await AlterTable.execute(originalTable, renamedTable, transaction);
    let [renamedTableResults]: any = await sequelize.query(
      `SELECT table_name FROM information_schema.tables WHERE table_name = '${renamedTable}';`,
      { transaction },
    );
    expect(
      Array.isArray(renamedTableResults) ? renamedTableResults.length : 0,
    ).toBe(1);

    await AlterColumn.execute(
      renamedTable,
      initialColumn,
      updatedColumn,
      { nullable: true },
      transaction,
    );
    let [updatedColumnResults]: any = await sequelize.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = '${renamedTable}' AND column_name = '${updatedColumn}';`,
      { transaction },
    );
    expect(
      Array.isArray(updatedColumnResults) ? updatedColumnResults.length : 0,
    ).toBe(1);

    await DropColumn.execute(renamedTable, updatedColumn, transaction);
    let [afterDropResults]: any = await sequelize.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = '${renamedTable}' AND column_name = '${updatedColumn}';`,
      { transaction },
    );
    expect(Array.isArray(afterDropResults) ? afterDropResults.length : 0).toBe(
      0,
    );

    await DropTable.execute(renamedTable, transaction);
    let [afterTableDropResults]: any = await sequelize.query(
      `SELECT table_name FROM information_schema.tables WHERE table_name = '${renamedTable}';`,
      { transaction },
    );
    expect(
      Array.isArray(afterTableDropResults) ? afterTableDropResults.length : 0,
    ).toBe(0);
  });
});
