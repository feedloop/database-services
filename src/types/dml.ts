export type DMLOperations =
  | { operation: 'Select'; instruction: SelectInstruction }
  | { operation: 'Insert'; instruction: InsertInstruction }
  | { operation: 'Update'; instruction: UpdateInstruction }
  | { operation: 'Delete'; instruction: DeleteInstruction };

export type PrimitiveType = string | number | boolean | null;

export type ConditionOperator =
  | { $eq: PrimitiveType }
  | { $neq: PrimitiveType }
  | { $gt: number }
  | { $gte: number }
  | { $lt: number }
  | { $lte: number }
  | { $in: PrimitiveType[] }
  | { $nin: PrimitiveType[] };

export type LogicalOperator =
  | { $and: Condition[] }
  | { $or: Condition[] }
  | { [column: string]: ConditionOperator };

export type Condition = LogicalOperator;

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
