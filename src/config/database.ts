import { Sequelize, Dialect } from 'sequelize';
const config = require('./config');


const sequelize = new Sequelize(
  config.development.database,
  config.development.username,
  config.development.password,
  {
    ...config.development,
    dialect: config.development.dialect as Dialect, 
  }
);

export { sequelize };
