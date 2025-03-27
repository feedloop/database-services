import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth-middleware';
import { getApiKey, regenerateApiKey } from '../controllers/apikey-controller';

const router = Router();

router.get('/', authMiddleware, getApiKey);
router.put('/', authMiddleware, regenerateApiKey);

export default router;
