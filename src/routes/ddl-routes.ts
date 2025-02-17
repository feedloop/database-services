import { Router } from 'express';
const { handleDDLRequest } = require('../controllers/ddl-controller');

const router = Router();

router.post('/', handleDDLRequest);

export default router;
