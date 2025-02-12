import { Router } from 'express';
const { getUserDetails } = require('../controllers/user-controller');
const { authMiddleware } = require('../middlewares/auth-middleware');

const router = Router();

router.get('/user', authMiddleware, getUserDetails);

export default router;
