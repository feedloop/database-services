import { Router } from 'express';
const { registerUser, loginUser } = require('../controllers/userController');

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

export default router;
