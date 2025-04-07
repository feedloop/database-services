import { Router } from 'express';
import { apiKeyMiddleware } from '../middlewares/apikey-middleware';
import { migrate } from '../controllers/ddl-controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: DDL Operations
 *   description: API for performing DDL (Data Definition Language) operations
 */

/**
 * @swagger
 * /migrate:
 *   post:
 *     summary: Execute DDL operations
 *     tags: [DDL Operations]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               operations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     operation:
 *                       type: string
 *                       enum: [Create, Alter, Drop]
 *                     resource:
 *                       type: string
 *                       enum: [Table, Column]
 *                     migration:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         table:
 *                           type: string
 *                         column:
 *                           type: object
 *                           properties:
 *                             type:
 *                               type: string
 *                             definition:
 *                               type: object
 *                               properties:
 *                                 textType:
 *                                   type: string
 *                                 nullable:
 *                                   type: boolean
 *                                 unique:
 *                                   type: boolean
 *                                 default:
 *                                   type: string
 *                                 primary:
 *                                   type: boolean
 *                         from:
 *                           type: string
 *                         to:
 *                           type: string
 *                         primaryKey:
 *                           type: string
 *           example:
 *             operations:
 *               - operation: "Create"
 *                 resource: "Table"
 *                 migration:
 *                   name: "test"
 *                   primaryKey: "UUID"
 *               - operation: "Create"
 *                 resource: "Column"
 *                 migration:
 *                   name: "name"
 *                   table: "test"
 *                   column:
 *                     type: "text"
 *                     definition:
 *                       textType: "text"
 *                       default: null
 *                       unique: false
 *                       nullable: true
 *               - operation: "Create"
 *                 resource: "Column"
 *                 migration:
 *                   name: "description"
 *                   table: "test"
 *                   column:
 *                     type: "text"
 *                     definition:
 *                       textType: "text"
 *                       default: null
 *                       unique: false
 *                       nullable: true
 *               - operation: "Create"
 *                 resource: "Column"
 *                 migration:
 *                   name: "created_at"
 *                   table: "test"
 *                   column:
 *                     type: "timestamp"
 *                     definition:
 *                       default: "now()"
 *                       nullable: true
 *               - operation: "Create"
 *                 resource: "Column"
 *                 migration:
 *                   name: "updated_at"
 *                   table: "test"
 *                   column:
 *                     type: "timestamp"
 *                     definition:
 *                       default: "now()"
 *                       nullable: true
 *               - operation: "Alter"
 *                 resource: "Column"
 *                 migration:
 *                   from: "description"
 *                   to: "external_id"
 *                   table: "test"
 *                   column:
 *                     definition:
 *                       unique: true
 *                       default: null
 *                       nullable: false
 *               - operation: "Alter"
 *                 resource: "Table"
 *                 migration:
 *                   from: "test"
 *                   to: "new_test"
 *               - operation: "Drop"
 *                 resource: "Column"
 *                 migration:
 *                   table: "new_test"
 *                   column: "external_id"
 *               - operation: "Drop"
 *                 resource: "Table"
 *                 migration:
 *                   name: "new_test"
 *     responses:
 *       200:
 *         description: DDL operations completed successfully
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
 *                   example: DDL operations completed successfully
 *       400:
 *         description: Invalid payload structure
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
 *                   example: Invalid payload structure
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
router.post('/', apiKeyMiddleware, migrate);

export default router;
