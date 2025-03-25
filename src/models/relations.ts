import MetadataTable from './metadata-table';
import MetadataColumn from './metadata-column';

MetadataTable.hasMany(MetadataColumn, {
  foreignKey: 'table_id',
  as: 'columns',
  onDelete: 'CASCADE',
});

MetadataColumn.belongsTo(MetadataTable, {
  foreignKey: 'table_id',
  as: 'table',
  onDelete: 'CASCADE',
});
