import { Transaction } from 'sequelize';
import MetadataColumnRepository from '../repositories/metadata-column-repository';
import MetadataTableRepository from '../repositories/metadata-table-repository';
import { Condition, ConditionOperator, LogicalOperator } from '../types/dml';

export function validIdentifier(name: string): boolean {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
}

export function validateSQL(data: any): void {
  if (typeof data === 'object' && data !== null) {
    for (const value of Object.values(data)) {
      if (typeof value === 'string' && /['";]/.test(value)) {
        throw new Error(`Invalid SQL input detected`);
      }
      if (typeof value === 'object') {
        validateSQL(value);
      }
    }
  }
}

export function validateCondition(
  condition: Condition,
  metadataColumns?: any[],
): void {
  if (isLogicalOperator(condition)) {
    if ('$and' in condition && Array.isArray(condition.$and)) {
      condition.$and.forEach((subCond) =>
        validateCondition(subCond, metadataColumns),
      );
    }
    if ('$or' in condition && Array.isArray(condition.$or)) {
      condition.$or.forEach((subCond) =>
        validateCondition(subCond, metadataColumns),
      );
    }
  } else {
    const conditionObject = condition as Record<string, any>;
    for (const key in conditionObject) {
      const columnCondition = conditionObject[key];

      if (isConditionOperator(columnCondition)) {
        const operator = Object.keys(columnCondition)[0];
        const value = columnCondition[operator as keyof ConditionOperator];

        if (metadataColumns) {
          const column = metadataColumns.find((col) => col.column_name === key);
          if (column && !isValidType(column.data_type.toUpperCase(), value)) {
            throw new Error(
              `Invalid type for column ${key}: expected ${column.data_type}, got ${typeof value}`,
            );
          }
        }
      }
    }
  }
}

export async function validateDataType(
  table: string,
  data: Record<string, any>,
  transaction: Transaction,
): Promise<void> {
  const metadataTable = await MetadataTableRepository.findOne(
    { table_name: table },
    transaction,
  );
  if (!metadataTable) throw new Error(`Table ${table} does not exist`);

  const metadataColumns = await MetadataColumnRepository.findAll(
    { table_id: metadataTable.id },
    transaction,
  );
  if (!metadataColumns.length)
    throw new Error(`No columns found for table ${table}`);

  const columnMap = new Map(
    metadataColumns.map((col) => [col.column_name, col]),
  );

  for (const key in data) {
    if (isLogicalOperator(data[key]) || isConditionOperator(data[key]))
      continue;

    const column = columnMap.get(key);
    if (!column)
      throw new Error(`Column ${key} does not exist in table ${table}`);

    const expectedType = column.data_type.toUpperCase();
    const actualValue = data[key];

    if (actualValue === null) {
      if (!column.is_nullable) throw new Error(`Column ${key} cannot be NULL`);
      continue;
    }

    if (!isValidType(expectedType, actualValue)) {
      throw new Error(
        `Invalid type for column ${key}: expected ${expectedType}, got ${typeof actualValue}`,
      );
    }
  }
}

function isConditionOperator(obj: any): obj is ConditionOperator {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    Object.keys(obj).some((key) =>
      ['$eq', '$neq', '$gt', '$gte', '$lt', '$lte', '$in', '$nin'].includes(
        key,
      ),
    )
  );
}

function isLogicalOperator(obj: any): obj is LogicalOperator {
  return (
    typeof obj === 'object' && obj !== null && ('$and' in obj || '$or' in obj)
  );
}

function isValidType(expectedType: string, value: any): boolean {
  if (/CHAR|TEXT/.test(expectedType)) {
    return typeof value === 'string';
  }
  if (/INT|DECIMAL|NUMERIC/.test(expectedType)) {
    return typeof value === 'number' && !isNaN(value);
  }
  if (/BOOLEAN/.test(expectedType)) {
    return typeof value === 'boolean';
  }
  if (/DATE|TIMESTAMP/.test(expectedType)) {
    return value instanceof Date || !isNaN(Date.parse(value));
  }
  if (/UUID/.test(expectedType)) {
    return typeof value === 'string' && /^[0-9a-fA-F-]{36}$/.test(value);
  }
  return true;
}
