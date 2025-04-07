import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth-middleware';
import { getApiKey, regenerateApiKey } from '../controllers/apikey-controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: API Key
 *   description: API for managing user API key
 */

/**
 * @swagger
 * /apikey:
 *   get:
 *     summary: Get API key
 *     tags: [API Key]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved API key
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
 *                   example: User details retrieved
 *                 apikey:
 *                   type: string
 *                   example: 'example-api-key'
 *       401:
 *         description: Unauthorized (Invalid or missing token)
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
 */
router.get('/', authMiddleware, getApiKey);

/**
 * @swagger
 * /apikey:
 *   put:
 *     summary: Regenerate API key
 *     tags: [API Key]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully regenerated API key
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
 *                   example: User details retrieved
 *                 apikey:
 *                   type: string
 *                   example: 'new-example-api-key'
 *       401:
 *         description: Unauthorized (Invalid or missing token)
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
 */
router.put('/', authMiddleware, regenerateApiKey);

export default router;
