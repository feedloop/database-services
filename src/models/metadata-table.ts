import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

class MetadataTable extends Model {
  public id!: string;
  public table_name!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

MetadataTable.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    table_name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
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
    modelName: 'MetadataTable',
    tableName: 'metadata_table',
    timestamps: true,
    underscored: true,
  },
);

export default MetadataTable;
