import { Request, Response } from 'express';
import SchemaRepository from '../repositories/schema-repository';

export const schema = async (req: Request, res: Response) => {
  try {
    const tables = await SchemaRepository.getSchemas();

    return res.json({ success: true, tables });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
};
