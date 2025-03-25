import { Router } from 'express';
import { apiKeyMiddleware } from '../middlewares/apikey-middleware';
import { schema } from '../controllers/schema-controller';

const router = Router();

router.get('/', apiKeyMiddleware, schema);

export default router;
