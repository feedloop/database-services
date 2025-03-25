import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response';
import UserRepository from '../repositories/user-repository';

export const apiKeyMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      return errorResponse(res, 'Unauthorized', 401);
    }

    const user = await UserRepository.findOne({ apikey: apiKey });
    if (!user) {
      return errorResponse(res, 'Unauthorized', 401);
    }

    (req as any).user = user;
    next();
  } catch (error) {
    console.error('Error:', error);
    return errorResponse(res, 'Unauthorized', 401);
  }
};
