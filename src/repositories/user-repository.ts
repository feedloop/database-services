import Users from '../models/user';

class UserRepository {
    static async findByEmail(email: string) {
      return await Users.findOne({ where: { email } });
    }
  
    static async findById(userId: number) {
      return await Users.findByPk(userId, {
        attributes: { exclude: ['password'] }
      });
    }
  
    static async createUser(data: { name: string; email: string; password: string; apikey: string }) {
      return await Users.create(data);
    }
  }

  export default UserRepository;