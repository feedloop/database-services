import dotenv from 'dotenv';

dotenv.config();

const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] ?? defaultValue;

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

interface EnvConfig {
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  DB_HOST: string;
}

export const ENV: EnvConfig = {
  PORT: Number(getEnv('PORT', '3000')),
  NODE_ENV: getEnv('NODE_ENV', 'development') as
    | 'development'
    | 'production'
    | 'test',
  JWT_SECRET: getEnv('JWT_SECRET'),
  JWT_EXPIRES_IN: getEnv('JWT_EXPIRES_IN', '1h'),
  DB_USERNAME: getEnv('DB_USERNAME'),
  DB_PASSWORD: getEnv('DB_PASSWORD'),
  DB_NAME: getEnv('DB_NAME', 'database_services'),
  DB_HOST: getEnv('DB_HOST', 'localhost'),
};
