import dotenv from "dotenv";
dotenv.config();

const config = {
  development: {
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "12345678",
    database: process.env.DB_NAME || "database_services",
    host: process.env.DB_HOST || "localhost",
    dialect: "postgres",
    logging: false,
  },
  test: {
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "12345678",
    database: process.env.DB_NAME || "database_services_test",
    host: process.env.DB_HOST || "localhost",
    dialect: "postgres",
    logging: false,
  },
  production: {
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "12345678",
    database: process.env.DB_NAME || "database_services_prod",
    host: process.env.DB_HOST || "localhost",
    dialect: "postgres",
    logging: false,
  }
};

export default config;
