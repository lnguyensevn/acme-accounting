import {
  Table,
  Column,
  Model,
  BelongsTo,
  ForeignKey,
  PrimaryKey,
  AutoIncrement,
} from 'sequelize-typescript';
import { Company } from '../companies/company.model';

export enum UserRole {
  accountant = 'accountant',
  corporateSecretary = 'corporateSecretary',
  director = 'director',
}

export enum UserStatus {
  active = 'active',
  inactive = 'inactive',
}

@Table({ tableName: 'users' })
export class User extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column
  declare id: number;

  @Column
  declare name: string;

  @Column
  declare role: UserRole;

  @Column
  declare status: UserStatus;

  @ForeignKey(() => Company)
  @Column({
    field: 'company_id',
  })
  declare companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @Column({
    field: 'created_at',
    allowNull: false,
    defaultValue: new Date(),
  })
  declare createdAt: Date;

  @Column({
    field: 'updated_at',
    allowNull: true,
    defaultValue: new Date(),
  })
  declare updatedAt: Date;
}
