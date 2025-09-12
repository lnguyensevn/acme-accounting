import { Injectable } from '@nestjs/common';
import { User } from './user.model';
import { CreateUserDto } from './libs/users.types';

@Injectable()
export class UserService {
  async createUser(newUser: CreateUserDto): Promise<User> {
    const user = await User.create({
      name: newUser.name,
      role: newUser.role,
      companyId: newUser.companyId,
    });
    return user;
  }
}
