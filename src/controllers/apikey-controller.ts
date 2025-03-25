import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { successResponse, errorResponse } from '../utils/response';
import UserRepository from '../repositories/user-repository';
import { generateApiKey } from '../utils/auth';

export const getApiKey = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return errorResponse(res, 'Unauthorized', 401);
    }

    const decoded: any = jwt.verify(token, ENV.JWT_SECRET);
    const user = await UserRepository.findOne({ id: decoded.userId });

    if (!user) {
      return errorResponse(res, 'Unauthorized', 401);
    }

    return successResponse(
      res,
      { apikey: user.apikey },
      'User details retrieved',
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Unauthorized', 401);
  }
};

export const regenerateApiKey = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return errorResponse(res, 'Unauthorized', 401);
    }

    const decoded: any = jwt.verify(token, ENV.JWT_SECRET);
    const user = await UserRepository.findOne({ id: decoded.userId });

    if (!user) {
      return errorResponse(res, 'Unauthorized', 401);
    }

    const newApiKey = await generateApiKey();
    await UserRepository.update({ id: decoded.userId }, { apikey: newApiKey });

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
