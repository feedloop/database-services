import { Condition } from '../types/dml';

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
        if (typeof value === 'object' && value !== null && '$eq' in value) {
          let paramValue = value['$eq'];
          if (
            typeof paramValue === 'string' &&
            paramValue.startsWith('{{') &&
            paramValue.endsWith('}}')
          ) {
            const paramKey = paramValue.slice(2, -2);
            paramValue = params?.[paramKey];
          }
          clauses.push(`"${key}" = $${index}`);
          replacements.push(paramValue);
          index++;
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
        let value = cond[key];

        if (typeof value === 'object' && Object.keys(value).length === 1) {
          const operator = Object.keys(value)[0];
          let paramValue = value[operator];

          if (
            typeof paramValue === 'string' &&
            paramValue.startsWith('{{') &&
            paramValue.endsWith('}}')
          ) {
            const paramKey = paramValue.slice(2, -2);
            paramValue = params?.[paramKey] ?? null;
          }

          const paramPlaceholder = `param_${depth}_${key}`;
          replacements[paramPlaceholder] = paramValue;

          switch (operator) {
            case '$eq':
              conditions.push(`"${key}" = :${paramPlaceholder}`);
              break;
            case '$ne':
              conditions.push(`"${key}" != :${paramPlaceholder}`);
              break;
            case '$lt':
              conditions.push(`"${key}" < :${paramPlaceholder}`);
              break;
            case '$gt':
              conditions.push(`"${key}" > :${paramPlaceholder}`);
              break;
            case '$lte':
              conditions.push(`"${key}" <= :${paramPlaceholder}`);
              break;
            case '$gte':
              conditions.push(`"${key}" >= :${paramPlaceholder}`);
              break;
          }
        }
      }
    }

    return conditions.length > 0 ? conditions.join(' AND ') : '';
  };

  return buildClause(condition);
}
