import { sequelize } from './config/database';

async function syncDatabase() {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synchronized successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Failed to synchronize database:', error);
    process.exit(1);
  }
}

syncDatabase();
