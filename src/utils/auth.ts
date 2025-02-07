import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const generateApiKey = (): string => {
  return randomBytes(32).toString('hex'); // API key unik 64 karakter
};
