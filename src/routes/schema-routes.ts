import { Router } from 'express';
const { schema } = require('../controllers/schema-controller');

const router = Router();

router.get('/', schema);

export default router;
