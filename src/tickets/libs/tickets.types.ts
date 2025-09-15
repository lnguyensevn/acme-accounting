import { PaginationParamiters } from '../../common/type';
import { TicketCategory, TicketStatus, TicketType } from '../ticket.model';

export interface TicketDto {
  id: number;
  type: TicketType;
  companyId: number;
  assigneeId: number;
  status: TicketStatus;
  category: TicketCategory;
}

export interface CreateTicketDto {
  type: TicketType;
  companyId: number;
  status: TicketStatus;
  category: TicketCategory;
}

export type TicketFilter = {
  type?: TicketType;
  companyId?: number;
  assigneeId?: number;
  status?: TicketStatus;
  category?: TicketCategory;
} & PaginationParamiters;
