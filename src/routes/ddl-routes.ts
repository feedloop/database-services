import { Router } from 'express';
import { apiKeyMiddleware } from '../middlewares/apikey-middleware';
import { migrate } from '../controllers/ddl-controller';

const router = Router();

router.post('/', apiKeyMiddleware, migrate);

export default router;
