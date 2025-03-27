import { Request, Response } from 'express';
import { successResponse, errorResponse } from '../utils/response';
import UserRepository from '../repositories/user-repository';
import { generateApiKey } from '../utils/auth';
import Users from '../models/user';
import { InferAttributes } from 'sequelize';

type UserType = InferAttributes<Users>;

interface AuthRequest extends Request {
  user?: UserType;
}

export const getApiKey = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return errorResponse(res, 'Unauthorized', 401);
    }

    return successResponse(
      res,
      { apikey: req.user.apikey },
      'User details retrieved',
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Unauthorized', 401);
  }
};

export const regenerateApiKey = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return errorResponse(res, 'Unauthorized', 401);
    }

    const newApiKey = await generateApiKey();
    await UserRepository.update({ id: req.user.id }, { apikey: newApiKey });

    return successResponse(
      res,
      { apikey: newApiKey },
      'User details retrieved',
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Unauthorized', 401);
  }
};
