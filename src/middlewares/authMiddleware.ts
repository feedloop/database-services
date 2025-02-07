import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'supersecretkey';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Akses ditolak. Token tidak ditemukan.' });
        }

        const decoded = jwt.verify(token, SECRET_KEY);
        (req as any).user = decoded; // Simpan data user di request
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token tidak valid.' });
    }
};
