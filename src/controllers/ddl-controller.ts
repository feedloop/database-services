import { Request, Response } from 'express';
import { QueryTypes } from 'sequelize';
import MetadataTableRepository from '../repositories/metadata-table-repository';
import MetadataColumnRepository from '../repositories/metadata-column-repository';
import { successResponse, errorResponse } from '../utils/response';
import { sequelize } from '../config/database';
import MetadataTable from '../models/metadata-table';
import MetadataColumn from '../models/metadata-column';

export const handleDDLRequest = async (req: Request, res: Response) => {
  const { operations } = req.body;

  if (!operations || !Array.isArray(operations)) {
    return errorResponse(res, 'Invalid payload structure', 400);
  }

  const transaction = await sequelize.transaction();
  try {
    for (const op of operations) {
      const { operation, resource, migration } = op;

      // CREATE TABLE
      if (operation === 'Create' && resource === 'Table') {
        const { name } = migration;

        const tableExists = await MetadataTableRepository.isTableExists(name);
        if (tableExists) {
          throw new Error(`Table ${name} already exists`);
        }

        // SQL EXECUTION FOR CREATE TABLE
        await sequelize.query(
          `CREATE TABLE IF NOT EXISTS "${name}" (id UUID PRIMARY KEY DEFAULT gen_random_uuid())`,
          { transaction },
        );

        // ADD TO METADATA
        await MetadataTableRepository.createTable({ table_name: name });
      }

      // CREATE COLUMN
      if (operation === 'Create' && resource === 'Column') {
        const { table, name: columnName, column } = migration;
        const metadataTable = await MetadataTable.findOne({
          where: { table_name: table },
        });

        if (!metadataTable) throw new Error(`Table ${table} does not exist`);

        const columnExists = await sequelize.query(
          `SELECT column_name FROM information_schema.columns 
           WHERE table_name = :table AND column_name = :column`,
          {
            replacements: { table, column: columnName },
            type: QueryTypes.SELECT,
          },
        );

        if (columnExists.length > 0) {
          throw new Error(
            `Column "${columnName}" already exists in table "${table}"`,
          );
        }

        let colType = column.type;
        const colDef = column.definition;

        if (colType.toLowerCase() === 'datetime') {
          colType = 'TIMESTAMP';
        }

        const defaultValue = colDef?.default
          ? `DEFAULT ${colDef.default === 'now()' ? 'CURRENT_TIMESTAMP' : colDef.default}`
          : '';

        const isPrimary = colDef?.primary || false;
        const isNullable = colDef?.nullable ?? true;
        const isUnique = colDef?.unique ?? false;

        // SQL EXECUTION FOR ADD COLUMN WITH DEFAULT
        await sequelize.query(
          `ALTER TABLE "${table}" ADD COLUMN "${columnName}" ${colType} ${defaultValue} ${isNullable ? '' : 'NOT NULL'} ${isUnique ? 'UNIQUE' : ''}`,
          { transaction },
        );

        // ADD TO METADATA
        await MetadataColumnRepository.createColumn({
          table_id: metadataTable.id,
          column_name: columnName,
          data_type: colType,
          is_primary: isPrimary,
          is_nullable: isNullable,
          is_unique: isUnique,
        });
      }

      // ALTER COLUMN
      if (operation === 'Alter' && resource === 'Column') {
        const { from, to, table, column } = migration;
        const metadataTable = await MetadataTable.findOne({
          where: { table_name: table },
        });
        if (!metadataTable) throw new Error(`Table ${table} does not exist`);

        const existingColumn = await MetadataColumn.findOne({
          where: { table_id: metadataTable.id, column_name: from },
        });
        if (!existingColumn) throw new Error(`Column ${from} does not exist`);

        const colDef = column.definition;

        if (from !== to) {
          await sequelize.query(
            `ALTER TABLE "${table}" RENAME COLUMN "${from}" TO "${to}"`,
            { transaction },
          );
          await existingColumn.update({ column_name: to });
        }

        const alterQueries: string[] = [];
        if (colDef?.nullable !== undefined) {
          const nullOption = colDef.nullable ? 'DROP NOT NULL' : 'SET NOT NULL';
          alterQueries.push(`ALTER COLUMN "${to}" ${nullOption}`);
        }
        if (colDef?.default !== undefined) {
          const defaultValue =
            colDef.default === 'now()' ? 'CURRENT_TIMESTAMP' : colDef.default;
          if (defaultValue === null) {
            alterQueries.push(`ALTER COLUMN "${to}" DROP DEFAULT`);
          } else {
            alterQueries.push(
              `ALTER COLUMN "${to}" SET DEFAULT ${defaultValue}`,
            );
          }
        }
        if (colDef?.unique !== undefined) {
          const constraintName = `${table}_${to}_unique`;
          if (colDef.unique) {
            alterQueries.push(
              `ADD CONSTRAINT "${constraintName}" UNIQUE ("${to}")`,
            );
          } else {
            alterQueries.push(`DROP CONSTRAINT IF EXISTS "${constraintName}"`);
          }
        }

        // EXECUTE ALL CHANGE
        for (const query of alterQueries) {
          await sequelize.query(`ALTER TABLE "${table}" ${query}`, {
            transaction,
          });
        }

        // UPDATE METADATA
        await existingColumn.update({
          is_nullable: colDef?.nullable ?? existingColumn.is_nullable,
          is_unique: colDef?.unique ?? existingColumn.is_unique,
        });
      }

      // DROP COLUMN
      if (operation === 'Drop' && resource === 'Column') {
        const { table, column } = migration;

        const metadataTable = await MetadataTable.findOne({
          where: { table_name: table },
        });
        if (!metadataTable) throw new Error(`Table ${table} does not exist`);

        // SQL EXECUTION FOR DROP COLUMN
        await sequelize.query(
          `ALTER TABLE "${table}" DROP COLUMN IF EXISTS "${column}"`,
          { transaction },
        );

        // DELETE METADATA
        await MetadataColumnRepository.deleteColumn(metadataTable.id, column);
      }

      // DROP TABLE
      if (operation === 'Drop' && resource === 'Table') {
        const { name } = migration;

        const tableExists = await MetadataTableRepository.isTableExists(name);
        if (!tableExists) {
          throw new Error(`Table ${name} does not exist`);
        }

        const tableData = await MetadataTableRepository.findByName(name);
        if (!tableData) {
          throw new Error(`Table data for ${name} not found`);
        }

        const tableId = tableData.id;

        // SQL EXECUTION FOR DROP TABLE
        await sequelize.query(`DROP TABLE "${name}"`, { transaction });

        // DELETE METADATA
        await MetadataTableRepository.deleteColumnsByTableId(tableId);
        await MetadataTableRepository.deleteTableByName(name);
      }
    }

    await transaction.commit();
    return successResponse(res, {}, 'DDL operations completed successfully');
  } catch (error: any) {
    await transaction.rollback();
    console.error('DDL ERROR:', error);
    return errorResponse(
      res,
      error.message || 'Failed to execute DDL operations',
      500,
    );
  }
};
