import dotenv from 'dotenv';

dotenv.config();

const getEnv = (key: string, required = false, defaultValue?: string): string => {
  const value = process.env[key];

  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value ?? defaultValue!;
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
  PORT: Number(getEnv('PORT', false, '3000')),
  NODE_ENV: getEnv('NODE_ENV', false, 'development') as 'development' | 'production' | 'test',
  JWT_SECRET: getEnv('JWT_SECRET', true),
  JWT_EXPIRES_IN: getEnv('JWT_EXPIRES_IN', false, '1h'),
  DB_USERNAME: getEnv('DB_USERNAME', true),
  DB_PASSWORD: getEnv('DB_PASSWORD', true),
  DB_NAME: getEnv('DB_NAME', false, 'database_services'),
  DB_HOST: getEnv('DB_HOST', false, 'localhost'),
};
