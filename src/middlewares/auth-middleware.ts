import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/response';
import { ENV } from '../config/env';
import UserRepository from '../repositories/user-repository';
import Users from '../models/user';
import { InferAttributes } from 'sequelize';

type UserType = InferAttributes<Users>;

interface AuthRequest extends Request {
  user?: UserType;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return errorResponse(res, 'Unauthorized', 401);
    }

    const decoded: any = jwt.verify(token, ENV.JWT_SECRET);
    const user = await UserRepository.findOne(
      { id: decoded.userId },
      { attributes: { exclude: ['password'] } },
    );

    if (!user) {
      return errorResponse(res, 'Unauthorized', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error:', error);
    return errorResponse(res, 'Unauthorized', 401);
  }
};
