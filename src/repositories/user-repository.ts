import Users from '../models/user';
import { WhereOptions } from 'sequelize';

class UserRepository {
  static async findOne(condition: WhereOptions) {
    return await Users.findOne({ where: condition });
  }

  static async insert(data: {
    name: string;
    email: string;
    password: string;
    apikey: string;
  }) {
    return await Users.create(data);
  }
}

export default UserRepository;
