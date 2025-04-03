import { Router } from 'express';
import { apiKeyMiddleware } from '../middlewares/apikey-middleware';
import { execute } from '../controllers/dml-controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: DML Operations
 *   description: API for performing DML (Data Manipulation Language) operations
 */

/**
 * @swagger
 * /execute:
 *   post:
 *     summary: Execute DML operations
 *     tags: [DML Operations]
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
 *                       enum: [Select, Insert, Update, Delete]
 *                     instruction:
 *                       type: object
 *                       properties:
 *                         table:
 *                           type: string
 *                         name:
 *                           type: string
 *                         data:
 *                           type: object
 *                         set:
 *                           type: object
 *                         condition:
 *                           type: object
 *                         orderBy:
 *                           type: object
 *                           additionalProperties:
 *                             type: string
 *                             enum: [ASC, DESC]
 *                         limit:
 *                           type: integer
 *                         offset:
 *                           type: integer
 *                         params:
 *                           type: object
 *           example:
 *             operations:
 *               - operation: "Insert"
 *                 instruction:
 *                   table: "test_dml"
 *                   name: "data"
 *                   data:
 *                     external_id: "admin1"
 *                     email: "admin1@admin.com"
 *               - operation: "Insert"
 *                 instruction:
 *                   table: "test_dml"
 *                   name: "data"
 *                   data:
 *                     external_id: "admin4"
 *                     email: "admin4@admin.com"
 *               - operation: "Update"
 *                 instruction:
 *                   table: "test_dml"
 *                   name: "data"
 *                   condition:
 *                     "$and":
 *                       - external_id:
 *                           "$eq": "admin1"
 *                   set:
 *                     external_id: "admin1"
 *               - operation: "Delete"
 *                 instruction:
 *                   table: "test_dml"
 *                   name: "data"
 *                   condition:
 *                     "$and":
 *                       - external_id:
 *                           "$eq": "admin1"
 *                   params: {}
 *               - operation: "Select"
 *                 instruction:
 *                   name: "data"
 *                   orderBy:
 *                     created_at: "ASC"
 *                   condition: {}
 *                   limit: 26
 *                   offset: 0
 *                   params: {}
 *                   table: "test_dml"
 *               - operation: "Select"
 *                 instruction:
 *                   name: "data"
 *                   orderBy:
 *                     created_at: "ASC"
 *                   condition:
 *                     "$or":
 *                       - "$or":
 *                           - email:
 *                               "$eq": "{{name}}"
 *                           - external_id:
 *                               "$eq": "user1"
 *                   limit: 26
 *                   offset: 0
 *                   params:
 *                     name: "admin@admin.com"
 *                   table: "test_dml"
 *     responses:
 *       200:
 *         description: DML operations executed successfully
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
 *                   example: DML operations completed successfully
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
router.post('/', apiKeyMiddleware, execute);

export default router;
