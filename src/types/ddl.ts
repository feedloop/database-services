export interface Operations {
  operation: 'Create' | 'Alter' | 'Drop';
  resource: 'Table' | 'Column';
  migration: MigrationDetails;
}

export interface MigrationDetails {
  name?: string;
  table?: string;
  column?: string;
  from?: string;
  to?: string;
  columnDefinition?: ColumnDefinition;
}

export interface ColumnDefinition {
  type: string;
  nullable?: boolean;
  unique?: boolean;
  default?: any;
  primary?: boolean;
}
