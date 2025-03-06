import { Request, Response } from 'express';
import { sequelize } from '../config/database';
import { Transaction } from 'sequelize';
import SchemaRepository from '../repositories/schema-repository';

export const schema = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();
  try {
    const transaction = await sequelize.transaction({
      isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
    });
    const tables = await SchemaRepository.getSchemas(transaction);

    const schema = tables.map((table) => ({
      tableId: table.id,
      tableName: table.table_name,
      columns:
        table.columns?.map((col) => ({
          columnId: col.id,
          name: col.column_name,
          type: col.data_type,
          isPrimary: col.is_primary,
          isNullable: col.is_nullable,
          isUnique: col.is_unique,
        })) || [],
    }));

    await transaction.commit();
    return res.json({ success: true, schema });
  } catch (error) {
    await transaction.rollback();
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
};
