import { Router } from 'express';
const { getUserDetails } = require('../controllers/userController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = Router();

router.get('/user', authMiddleware, getUserDetails);

export default router;
