export type DMLOperations =
  | { operation: 'Select'; instruction: SelectInstruction }
  | { operation: 'Insert'; instruction: InsertInstruction }
  | { operation: 'Update'; instruction: UpdateInstruction }
  | { operation: 'Delete'; instruction: DeleteInstruction };

export const ConditionOperatorType = {
  EQ: '$eq',
  NEQ: '$neq',
  GT: '$gt',
  GTE: '$gte',
  LT: '$lt',
  LTE: '$lte',
  IN: '$in',
  NIN: '$nin',
} as const;

export const OperatorSymbol = {
  $eq: '=',
  $neq: '!=',
  $gt: '>',
  $gte: '>=',
  $lt: '<',
  $lte: '<=',
  $in: 'IN',
  $nin: 'NOT IN',
} as const;

export type PrimitiveType = string | number | boolean | null;

export type ConditionOperator = Partial<
  Record<keyof typeof ConditionOperatorType, PrimitiveType | PrimitiveType[]>
>;

export type LogicalOperator = { $and: Condition[] } | { $or: Condition[] };

export type Condition = LogicalOperator | {};

export interface SelectInstruction {
  table: string;
  name: string;
  orderBy: Record<string, 'ASC' | 'DESC'>;
  condition: Condition;
  limit: number;
  offset: number;
  params: Record<string, any>;
}

export interface InsertInstruction {
  table: string;
  name: string;
  data: Record<string, string | number>;
}

export interface UpdateInstruction {
  table: string;
  name: string;
  condition: Condition;
  set: Record<string, string | number>;
  params: Record<string, any>;
}

export interface DeleteInstruction {
  table: string;
  name: string;
  condition: Condition;
  params: Record<string, any>;
}
