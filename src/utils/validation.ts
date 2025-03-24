import { Transaction } from 'sequelize';
import MetadataColumnRepository from '../repositories/metadata-column-repository';
import MetadataTableRepository from '../repositories/metadata-table-repository';
import {
  Condition,
  ConditionOperator,
  ConditionOperatorType,
  LogicalOperator,
} from '../types/dml';
import format from 'pg-format';

export function validIdentifier(name: string): boolean {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
}

export async function parseAndValidateData(
  table: string,
  data: Record<string, any>,
  transaction: Transaction,
): Promise<Record<string, any>> {
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

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      const sanitizedValue = format.literal(value);
      const normalizedValue = sanitizedValue.replace(/\s+/g, ' ').trim();

      if (
        normalizedValue.includes(';') ||
        /\bOR\b/i.test(normalizedValue) ||
        /\bAND\b/i.test(normalizedValue) ||
        normalizedValue.includes('--') ||
        normalizedValue.includes('#')
      ) {
        throw new Error(`Possible SQL injection detected in column ${key}`);
      }
    }

    const column = columnMap.get(key);
    if (!column)
      throw new Error(`Column ${key} does not exist in table ${table}`);

    const expectedType = column.data_type.toUpperCase();

    if (value === null) {
      if (!column.is_nullable) throw new Error(`Column ${key} cannot be NULL`);
      continue;
    }

    if (!isValidType(expectedType, value)) {
      throw new Error(
        `Invalid type for column ${key}: expected ${expectedType}, got ${typeof value}`,
      );
    }
  }

  return data;
}

export function parseAndValidateCondition(
  condition: Condition,
  metadataColumns?: any[],
  hasLogicalOperator = false,
): Condition {
  const isRoot = hasLogicalOperator === false;
  if (isRoot) {
    if (Object.keys(condition).length === 0) {
      return {};
    }
    if (!isLogicalOperator(condition)) {
      throw new Error('Invalid condition structure.');
    }
  }

  if (isLogicalOperator(condition)) {
    if ('$and' in condition && Array.isArray(condition.$and)) {
      condition.$and = condition.$and
        .map((subCond) =>
          parseAndValidateCondition(subCond, metadataColumns, true),
        )
        .filter((subCond) => Object.keys(subCond).length > 0);
    }
    if ('$or' in condition && Array.isArray(condition.$or)) {
      condition.$or = condition.$or
        .map((subCond) =>
          parseAndValidateCondition(subCond, metadataColumns, true),
        )
        .filter((subCond) => Object.keys(subCond).length > 0);
    }
  } else {
    validateAndSanitizeCondition(condition, metadataColumns);
  }

  return condition;
}

function validateAndSanitizeCondition(
  condition: Condition,
  metadataColumns?: any[],
): Condition {
  const conditionObject = condition as Record<string, any>;

  for (const key in conditionObject) {
    const columnCondition = conditionObject[key];

    if (isConditionOperator(columnCondition)) {
      const operator = Object.keys(columnCondition)[0];
      const value = columnCondition[operator as keyof ConditionOperator];

      if (typeof value === 'string') {
        const sanitizedValue = format.literal(value);
        const normalizedValue = sanitizedValue.replace(/\s+/g, ' ').trim();

        if (
          normalizedValue.includes(';') ||
          /\bOR\b/i.test(normalizedValue) ||
          /\bAND\b/i.test(normalizedValue) ||
          normalizedValue.includes('--') ||
          normalizedValue.includes('#')
        ) {
          throw new Error(`Possible SQL injection detected in column ${key}`);
        }
      }

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

  return condition;
}

function isConditionOperator(obj: any): obj is ConditionOperator {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    Object.keys(obj).some((key) =>
      (Object.values(ConditionOperatorType) as string[]).includes(key),
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
