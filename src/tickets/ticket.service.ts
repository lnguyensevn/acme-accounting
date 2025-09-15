import { Injectable } from '@nestjs/common';
import { TicketCreation } from './libs/tickets.creation';
import {
  Ticket,
  TicketCategory,
  TicketStatus,
  TicketType,
} from './ticket.model';
import { TicketDto, TicketFilter } from './libs/tickets.types';
import { ManagementReportService } from './ticket-creation/report-management.service';
import { ChangeAddressService } from './ticket-creation/change-address.service';
import { StrikeOffService } from './ticket-creation/strike-off.service';
import { getPagination } from '../utils/pagination';
import { PaginationResult } from '../common/type';

@Injectable()
export class TicketService {
  private readonly ticketCreation: Record<TicketType, TicketCreation>;

  constructor(
    private readonly management: ManagementReportService,
    private readonly changeAddress: ChangeAddressService,
    private readonly strikeOff: StrikeOffService,
  ) {
    this.ticketCreation = {
      [TicketType.strikeOff]: this.strikeOff,
      [TicketType.managementReport]: this.management,
      [TicketType.registrationAddressChange]: this.changeAddress,
    };
  }

  async list(filter: TicketFilter): Promise<PaginationResult<TicketDto>> {
    const where: Record<string, any> = {};
    if (filter.type) {
      where.type = filter.type;
    }
    if (filter.companyId) {
      where.companyId = filter.companyId;
    }
    if (filter.assigneeId) {
      where.assigneeId = filter.assigneeId;
    }
    if (filter.status) {
      where.status = filter.status;
    }
    if (filter.category) {
      where.category = filter.category;
    }

    const pagination = getPagination({
      current: filter.current || 1,
      pageSize: filter.pageSize || 20,
    });

    const data = await Ticket.findAll({
      where,
      limit: pagination.limit,
      offset: pagination.offset,
    });
    const total = await Ticket.count({ where });

    return {
      total,
      current: filter.current || 1,
      pageSize: filter.pageSize || 20,
      data,
    };
  }

  async createTicket(createTicket: {
    type: TicketType;
    companyId: number;
    category: TicketCategory;
    status: TicketStatus;
  }): Promise<TicketDto> {
    return this.ticketCreation[createTicket.type].create({
      type: createTicket.type,
      companyId: createTicket.companyId,
      category: createTicket.category,
      status: TicketStatus.open,
    });
  }
}
