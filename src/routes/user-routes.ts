import { Router } from 'express';
import { getUserDetails } from '../controllers/user-controller';
import { authMiddleware } from '../middlewares/auth-middleware';

const router = Router();

router.get('/user', authMiddleware, getUserDetails);

export default router;
