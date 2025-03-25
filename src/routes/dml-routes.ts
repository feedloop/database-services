import { Router } from 'express';
import { apiKeyMiddleware } from '../middlewares/apikey-middleware';
import { execute } from '../controllers/dml-controller';

const router = Router();

router.post('/', apiKeyMiddleware, execute);

export default router;
