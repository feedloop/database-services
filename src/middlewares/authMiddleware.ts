import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/response';
import { ENV } from '../config/env';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return errorResponse(res, 'Unauthorized.', 401);
        }

        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        (req as any).user = decoded;
        next();
    } catch (error) {
        return errorResponse(res, 'Invalid token.', 401);
    }
};
