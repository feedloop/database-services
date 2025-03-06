export interface DDLOperations {
  operation: 'Create' | 'Alter' | 'Drop';
  resource: 'Table' | 'Column';
  migration: MigrationDetails;
}

export interface MigrationDetails {
  name?: string;
  table?: string;
  column?: string | ColumnObject;
  from?: string;
  to?: string;
  description?: string;
  primaryKey?: string;
}

export interface ColumnObject {
  type?: string;
  definition?: ColumnDefinition;
}

export interface ColumnDefinition {
  textType?: string;
  nullable?: boolean;
  unique?: boolean;
  default?: any;
  primary?: boolean;
}
