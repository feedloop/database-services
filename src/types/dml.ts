export interface DMLOperations {
  operation: 'Select' | 'Insert' | 'Update' | 'Delete';
  instruction:
    | SelectInstruction
    | InsertInstruction
    | UpdateInstruction
    | DeleteInstruction;
}

export type ConditionOperator = {
  $eq?: string | number;
  $neq?: string | number | boolean | null;
  $gt?: number;
  $gte?: number;
  $lt?: number;
  $lte?: number;
  $in?: (string | number | boolean | null)[];
  $nin?: (string | number | boolean | null)[];
  $and?: Condition[];
  $or?: Condition[];
};

export type Condition =
  | { $and?: Condition[]; $or?: Condition[] }
  | Record<string, ConditionOperator>;

export interface Instruction {
  name?: string;
  table: string;
}

export interface SelectInstruction extends Instruction {
  orderBy?: Record<string, 'ASC' | 'DESC'>;
  condition?: Condition;
  limit?: number;
  offset?: number;
  params?: Record<string, any>;
}

export interface InsertInstruction extends Instruction {
  data: Record<string, string | number>;
}

export interface UpdateInstruction extends Instruction {
  condition: Condition;
  set: Record<string, string | number>;
  params?: Record<string, any>;
}

export interface DeleteInstruction extends Instruction {
  view?: string;
  condition: Condition;
  params?: Record<string, any>;
}
