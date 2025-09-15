import { PaginationParamiters } from '../../common/type';
import { UserRole } from '../user.model';

export interface CreateUserDto {
  name: string;
  role: UserRole;
  companyId: number;
}

export interface UserDto {
  id: number;
  name: string;
  role: UserRole;
  companyId: number;
}

export type ListUserFilter = {
  companyId?: number;
  role?: UserRole;
} & PaginationParamiters;
