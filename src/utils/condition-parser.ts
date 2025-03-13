import { Condition, ConditionOperator, PrimitiveType } from '../types/dml';

export function parseConditionForQuery(
  cond: Condition,
  replacements: Record<string, any>,
  params?: Record<string, any>,
): string {
  if (!cond || Object.keys(cond).length === 0) return '1=1';

  const clauses: string[] = [];
  let index = replacements.length + 1;

  for (const [key, value] of Object.entries(cond)) {
    switch (key) {
      case '$or':
        if (Array.isArray(value)) {
          const orClauses = value
            .map((v) => `(${parseConditionForQuery(v, replacements, params)})`)
            .join(' OR ');
          clauses.push(`(${orClauses})`);
        }
        break;

      case '$and':
        if (Array.isArray(value)) {
          const andClauses = value
            .map((v) => `(${parseConditionForQuery(v, replacements, params)})`)
            .join(' AND ');
          clauses.push(`(${andClauses})`);
        }
        break;

      default:
        if (
          typeof value === 'object' &&
          value !== null &&
          !Array.isArray(value)
        ) {
          const operatorKey = Object.keys(value)[0] as keyof ConditionOperator;
          const conditionValue = (value as ConditionOperator)[operatorKey];

          if (conditionValue !== undefined) {
            const sqlOperator = getSQLOperator(operatorKey);

            if (Array.isArray(conditionValue)) {
              const paramPlaceholder = `$${index}`;
              const sqlArrayType =
                typeof conditionValue[0] === 'number' ? 'integer[]' : 'text[]';

              clauses.push(
                `"${key}" ${sqlOperator} (${paramPlaceholder}::${sqlArrayType})`,
              );
              replacements[paramPlaceholder] = conditionValue;
            } else {
              clauses.push(`"${key}" ${getSQLOperator(operatorKey)} $${index}`);
              replacements.push(conditionValue);
            }
            index++;
          }
        }
        break;
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
          const operatorKey = Object.keys(value)[0] as keyof ConditionOperator;
          let paramValue: PrimitiveType = (value as ConditionOperator)[
            operatorKey
          ];

          if (typeof paramValue === 'string') {
            if (
              (paramValue as string).startsWith('{{') &&
              (paramValue as string).endsWith('}}')
            ) {
              const paramKey = (paramValue as string).slice(2, -2).trim();
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

function getSQLOperator(operator: keyof ConditionOperator): string {
  const operatorMap: Record<keyof ConditionOperator, string> = {
    $eq: '=',
    $neq: '!=',
    $gt: '>',
    $gte: '>=',
    $lt: '<',
    $lte: '<=',
    $in: `IN`,
    $nin: `NOT IN`,
  };

  return operatorMap[operator] || '=';
}
