import { Router } from 'express';
const { registerUser, loginUser, getUserDetails } = require('../controllers/userController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/user', authMiddleware, getUserDetails);

export default router;
