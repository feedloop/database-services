import { Router } from 'express';
import { apiKeyMiddleware } from '../middlewares/apikey-middleware';
import { executeQuery } from '../controllers/query-controller';

const router = Router();

router.post('/', apiKeyMiddleware, executeQuery);

export default router;
