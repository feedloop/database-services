import { Sequelize, Dialect } from 'sequelize';
import { ENV } from './env';
import config from './config';

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
  },
);

import '../models/relations';
export { sequelize };
