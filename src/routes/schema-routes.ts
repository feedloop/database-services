import { Router } from 'express';
import { apiKeyMiddleware } from '../middlewares/apikey-middleware';
import { schema } from '../controllers/schema-controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Schema Operations
 *   description: API for retrieving schema information of tables and columns
 */

/**
 * @swagger
 * /schemas:
 *   get:
 *     summary: Get schema information for all tables
 *     tags: [Schema Operations]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Schema information retrieved successfully
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
 *                   example: Schemas retrieved successfully
 *                 tables:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       table_name:
 *                         type: string
 *                         example: "users"
 *                       columns:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             column_name:
 *                               type: string
 *                               example: "id"
 *                             data_type:
 *                               type: string
 *                               example: "integer"
 *                             is_nullable:
 *                               type: boolean
 *                               example: false
 *                             default:
 *                               type: string
 *                               example: null
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
 */
router.get('/', apiKeyMiddleware, schema);

export default router;
