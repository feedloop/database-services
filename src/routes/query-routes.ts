import { Router } from 'express';
import { apiKeyMiddleware } from '../middlewares/apikey-middleware';
import { executeQuery } from '../controllers/query-controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Query Operations
 *   description: API for executing custom queries
 */

/**
 * @swagger
 * /query:
 *   post:
 *     summary: Execute a custom SQL query
 *     tags: [Query Operations]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *                 description: The SQL query string to execute
 *           example:
 *             query: "SELECT * FROM test_dml WHERE email = '{{email}}'"
 *     responses:
 *       200:
 *         description: Query executed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Query executed successfully
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     additionalProperties: true
 *       401:
 *         description: Unauthorized (Invalid or missing API key)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Failed to execute query
 */
router.post('/', apiKeyMiddleware, executeQuery);

export default router;
