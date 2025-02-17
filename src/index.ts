import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/user-routes';
import authRoutes from './routes/auth-routes';
import ddlRoutes from './routes/ddl-routes';
import { sequelize } from './config/database';

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log('Database synchronized successfully.');
  })
  .catch((err) => {
    console.error('Failed to synchronize database:', err);
  });

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const apiRouter = express.Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/migrate', ddlRoutes);

app.use('/api', apiRouter);

app.get('/health', (req: Request, res: Response) => {
  res.send('Hello, TypeScript with Express!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
