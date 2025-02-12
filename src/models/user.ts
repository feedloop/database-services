import { Model, DataTypes } from 'sequelize';
const { sequelize } = require('../config/database');

class Users extends Model {
  public id!: string;
  public name!: string;
  public email!: string;
  public password!: string;
  public apikey!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Users.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    apikey: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: 'Users',
    tableName: 'Users',
    timestamps: true,
    underscored: true,
  }
);

export default Users;
