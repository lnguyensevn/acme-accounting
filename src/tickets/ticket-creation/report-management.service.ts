import { Injectable } from '@nestjs/common';
import { TicketCreation } from '../libs/tickets.creation';
import { CreateTicketDto, TicketDto } from '../libs/tickets.types';
import { Ticket, TicketCategory, TicketType } from '../ticket.model';
import { User, UserRole } from '../../users/user.model';
import { AccountingTicketError } from '../../common/error';

@Injectable()
export class ManagementReportService extends TicketCreation {
  constructor() {
    super();
  }

  protected async validate(ticket: CreateTicketDto): Promise<void> {
    if (ticket.type !== TicketType.managementReport) {
      throw new AccountingTicketError('Invalid ticket type');
    }
    if (ticket.category !== TicketCategory.accounting) {
      throw new AccountingTicketError('Invalid ticket category');
    }

    const accountantCount = await User.count({
      where: { companyId: ticket.companyId, role: UserRole.accountant },
    });
    if (accountantCount <= 0) {
      throw new AccountingTicketError(
        'Cannot find user with role accountant to create a ticket',
      );
    }
  }

  async create(ticket: CreateTicketDto): Promise<TicketDto> {
    await this.validate(ticket);

    const accountant = await User.findOne({
      where: { companyId: ticket.companyId, role: UserRole.accountant },
      order: [['createdAt', 'DESC']],
    });

    if (!accountant) {
      throw new AccountingTicketError(
        'Cannot find user with role accountant to create a ticket',
      );
    }

    const ticketDb = await Ticket.create({
      type: ticket.type,
      category: ticket.category,
      companyId: ticket.companyId,
      assigneeId: accountant.id,
      status: ticket.status,
    });

    return this.mapToDto(ticketDb);
  }
}
