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

  static async update(condition: WhereOptions, data: Partial<Users>) {
    return await Users.update(data, { where: condition });
  }
}

export default UserRepository;
