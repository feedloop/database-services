import bcrypt from 'bcryptjs';
import { nanoid } from "nanoid";

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const generateApiKey = async (): Promise<string> => {
  return nanoid(64);
};