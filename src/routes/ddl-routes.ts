import { Router } from 'express';
const { migrate } = require('../controllers/ddl-controller');

const router = Router();

router.post('/', migrate);

export default router;
