import { Sequelize, Dialect } from 'sequelize';
import { ENV } from './env';
const config = require('./config');

const env = ENV.NODE_ENV;
const dbConfig = config[env];

if (!dbConfig) {
  throw new Error(`Database configuration for environment "${env}" not found.`);
}

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    ...dbConfig,
    dialect: dbConfig.dialect as Dialect,
  }
);

export { sequelize };
