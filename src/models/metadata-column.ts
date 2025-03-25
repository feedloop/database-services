import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import MetadataTable from './metadata-table';

class MetadataColumn extends Model {
  public id!: string;
  public table_id!: string;
  public column_name!: string;
  public data_type!: string;
  public is_primary!: boolean;
  public is_nullable!: boolean;
  public is_unique!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

MetadataColumn.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    table_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: MetadataTable,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    column_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    data_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_nullable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_unique: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'MetadataColumn',
    tableName: 'metadata_column',
    timestamps: true,
    underscored: true,
  },
);

export default MetadataColumn;
