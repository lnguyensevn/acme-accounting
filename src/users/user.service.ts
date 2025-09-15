import { Injectable } from '@nestjs/common';
import { User } from './user.model';
import { CreateUserDto, ListUserFilter, UserDto } from './libs/users.types';
import { getPagination } from '../utils/pagination';
import { PaginationResult } from '../common/type';

@Injectable()
export class UserService {
  async list(filter: ListUserFilter): Promise<PaginationResult<UserDto>> {
    const where: Record<string, any> = {};
    if (filter.companyId) {
      where.companyId = filter.companyId;
    }
    if (filter.role) {
      where.role = filter.role;
    }

    const pagination = getPagination({
      current: filter.current || 1,
      pageSize: filter.pageSize || 20,
    });
    const data = await User.findAll({
      where,
      limit: pagination.limit,
      offset: pagination.offset,
    });
    const total = await User.count({ where });
    return {
      data,
      total,
      current: filter.current || 1,
      pageSize: filter.pageSize || 20,
    };
  }

  async create(newUser: CreateUserDto): Promise<UserDto> {
    const user = await User.create({
      name: newUser.name,
      role: newUser.role,
      companyId: newUser.companyId,
    });
    return user;
  }
}
