import { Injectable } from '@nestjs/common';
import { TicketCreation } from './libs/tickets.creation';
import { TicketCategory, TicketStatus, TicketType } from './ticket.model';
import { TicketDto } from './libs/tickets.types';
import { ManagementReportService } from './ticket-creation/report-management.service';
import { ChangeAddressService } from './ticket-creation/change-address.service';
import { StrikeOffService } from './ticket-creation/strike-off.service';

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
