import { Router } from 'express';
import { getUserDetails } from '../controllers/user-controller';
import { authMiddleware } from '../middlewares/auth-middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API for managing user accounts
 */

/**
 * @swagger
 * /users/user:
 *   get:
 *     summary: Get user details
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User details retrieved successfully
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "123e4567-e89b-12d3-a456-426614174000"
 *                     name:
 *                       type: string
 *                       example: "Full Name"
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
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
router.get('/user', authMiddleware, getUserDetails);

export default router;
