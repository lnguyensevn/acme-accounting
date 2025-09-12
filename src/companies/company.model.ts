import {
  Table,
  Column,
  Model,
  HasMany,
  PrimaryKey,
  AutoIncrement,
} from 'sequelize-typescript';
import { User } from '../users/user.model';

interface CompanyCreateProperties {
  name: string;
  status: CompanyStatus;
}

interface CompanyProperties extends CompanyCreateProperties {
  id: number;
}

export enum CompanyStatus {
  active = 'active',
  inactive = 'inactive',
}

@Table({ tableName: 'companies' })
export class Company extends Model<CompanyProperties, CompanyCreateProperties> {
  @AutoIncrement
  @PrimaryKey
  @Column
  declare id: number;

  @Column
  declare name: string;

  @Column({ defaultValue: CompanyStatus.active })
  declare status: CompanyStatus;

  @HasMany(() => User)
  declare users: User[];
}
