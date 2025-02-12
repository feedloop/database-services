import User from '../models/user';

export class UserRepository {
    static async findByEmail(email: string) {
      return await User.findOne({ where: { email } });
    }
  
    static async findById(userId: number) {
      return await User.findByPk(userId, {
        attributes: { exclude: ['password'] }
      });
    }
  
    static async createUser(data: { name: string; email: string; password: string; apikey: string }) {
      return await User.create(data);
    }
  }