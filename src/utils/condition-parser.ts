import {
  Condition,
  ConditionOperator,
  ConditionOperatorType,
  OperatorSymbol,
  PrimitiveType,
} from '../types/dml';

export function parseConditionForQuery(
  cond: Condition,
  replacements: Record<string, any>[],
  params?: Record<string, any>,
): string {
  if (!cond || Object.keys(cond).length === 0) return '1=1';

  const clauses: string[] = [];

  for (const [key, value] of Object.entries(cond)) {
    switch (key) {
      case '$or': {
        if (Array.isArray(value)) {
          const orClauses = value
            .map((v) => `(${parseConditionForQuery(v, replacements, params)})`)
            .join(' OR ');
          clauses.push(`(${orClauses})`);
        }
        break;
      }

      case '$and': {
        if (Array.isArray(value)) {
          const andClauses = value
            .map((v) => `(${parseConditionForQuery(v, replacements, params)})`)
            .join(' AND ');
          clauses.push(`(${andClauses})`);
        }
        break;
      }

      default: {
        const conditionClause = parseComparisonCondition(
          key,
          value,
          replacements,
        );
        if (conditionClause) clauses.push(conditionClause);
        break;
      }
    }
  }

  return clauses.length > 0 ? clauses.join(' AND ') : '1=1';
}

export function parseConditionForNamedParams(
  condition: Condition,
  replacements: Record<string, any>,
  params?: Record<string, any>,
): string {
  if (!condition || Object.keys(condition).length === 0) return '';

  const buildClause = (cond: any, depth = 0): string => {
    if (typeof cond !== 'object') return '';

    const conditions: string[] = [];

    for (const key in cond) {
      if (['$and', '$or'].includes(key)) {
        const subConditions = cond[key].map(
          (subCond: any) => `(${buildClause(subCond, depth + 1)})`,
        );
        const operator = key === '$and' ? 'AND' : 'OR';
        conditions.push(subConditions.join(` ${operator} `));
      } else {
        const value = cond[key as keyof Condition];

        if (typeof value === 'object' && value !== null) {
          const operatorKey = Object.keys(
            value,
          )[0] as keyof typeof ConditionOperatorType;
          let paramValue: PrimitiveType = (
            value as Record<keyof typeof ConditionOperatorType, PrimitiveType>
          )[operatorKey];

          if (typeof paramValue === 'string') {
            if (paramValue.startsWith('{{') && paramValue.endsWith('}}')) {
              const paramKey = paramValue.slice(2, -2).trim();
              paramValue = params?.[paramKey] ?? null;
            }
          }

          const paramPlaceholder = `param_${depth}_${key}`;
          replacements[paramPlaceholder] = paramValue;

          if (Array.isArray(paramValue)) {
            conditions.push(
              `"${key}" ${getSQLOperator(operatorKey)} (:${paramPlaceholder})`,
            );
          } else {
            conditions.push(
              `"${key}" ${getSQLOperator(operatorKey)} :${paramPlaceholder}`,
            );
          }
        }
      }
    }

    return conditions.length > 0 ? conditions.join(' AND ') : '';
  };

  return buildClause(condition);
}

export function getSQLOperator(operator: keyof ConditionOperator): string {
  return OperatorSymbol[operator as keyof typeof OperatorSymbol] || '=';
}

function parseComparisonCondition(
  column: string,
  value: any,
  replacements: any[],
): string | null {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const operatorKey = Object.keys(
      value,
    )[0] as keyof typeof ConditionOperatorType;
    const conditionValue = (
      value as Record<keyof typeof ConditionOperatorType, PrimitiveType>
    )[operatorKey];

    if (conditionValue !== undefined) {
      const sqlOperator = getSQLOperator(operatorKey);
      const index = replacements.length + 1;

      if (Array.isArray(conditionValue)) {
        const paramPlaceholder = `$${index}`;
        const sqlArrayType =
          typeof conditionValue[0] === 'number' ? 'integer[]' : 'text[]';

        replacements.push(conditionValue);
        return `"${column}" ${sqlOperator} (${paramPlaceholder}::${sqlArrayType})`;
      } else {
        replacements.push(conditionValue);
        return `"${column}" ${sqlOperator} $${index}`;
      }
    }
  }
  return null;
}
