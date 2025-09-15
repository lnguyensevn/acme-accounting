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
import { User } from '../users/user.model';

export enum TicketStatus {
  open = 'open',
  resolved = 'resolved',
  deleted = 'deleted',
}

export enum TicketType {
  managementReport = 'managementReport',
  registrationAddressChange = 'registrationAddressChange',
  strikeOff = 'strikeOff',
}

export enum TicketCategory {
  accounting = 'accounting',
  corporate = 'corporate',
  management = 'management',
}

interface TicketCreationAttributes {
  type: TicketType;
  status: TicketStatus;
  category: TicketCategory;
  companyId: number;
  assigneeId: number;
}

interface TicketAttributes extends TicketCreationAttributes {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

@Table({ tableName: 'tickets', underscored: true })
export class Ticket extends Model<TicketAttributes, TicketCreationAttributes> {
  @AutoIncrement
  @PrimaryKey
  @Column
  declare id: number;

  @Column
  declare type: TicketType;

  @Column
  declare status: TicketStatus;

  @Column
  declare category: TicketCategory;

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

  @ForeignKey(() => Company)
  @Column({
    field: 'company_id',
  })
  declare companyId: number;

  @ForeignKey(() => User)
  @Column({
    field: 'assignee_id',
  })
  declare assigneeId: number;

  @BelongsTo(() => Company)
  company: Company;

  @BelongsTo(() => User)
  assignee: User;
}
