import { UserRole } from '../user.model';

export interface CreateUserDto {
  name: string;
  role: UserRole;
  companyId: number;
}

export interface GetUserDto {
  id: number;
  name: string;
  role: UserRole;
  companyId: number;
}
