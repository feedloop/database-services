import { Router } from 'express';
const { execute } = require('../controllers/dml-controller');

const router = Router();

router.post('/', execute);

export default router;
