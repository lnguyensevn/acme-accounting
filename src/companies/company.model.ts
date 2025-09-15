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
  updatedAt?: Date;
}

interface CompanyProperties extends CompanyCreateProperties {
  id: number;
  status: CompanyStatus;
  createdAt: Date;
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

  @Column({
    field: 'created_at',
    allowNull: false,
    defaultValue: new Date(),
  })
  declare createdAt: Date;

  @Column({
    field: 'updated_at',
    allowNull: false,
    defaultValue: new Date(),
  })
  declare updatedAt: Date;
}
