import { Injectable } from '@nestjs/common';
import { TicketCreation } from '../libs/tickets.creation';
import { CreateTicketDto, TicketDto } from '../libs/tickets.types';
import { Ticket, TicketCategory, TicketType } from '../ticket.model';
import { User, UserRole } from '../../users/user.model';
import { AccountingTicketError } from '../../common/error';

@Injectable()
export class ChangeAddressService extends TicketCreation {
  constructor() {
    super();
  }

  protected async validate(ticket: CreateTicketDto): Promise<void> {
    if (ticket.type !== TicketType.registrationAddressChange) {
      throw new AccountingTicketError('Invalid ticket type');
    }
    if (ticket.category !== TicketCategory.corporate) {
      throw new AccountingTicketError('Invalid ticket category');
    }

    const secretaryCount = await User.count({
      where: {
        companyId: ticket.companyId,
        role: UserRole.corporateSecretary,
      },
    });
    if (secretaryCount > 1) {
      throw new AccountingTicketError(
        `Multiple users with role ${UserRole.corporateSecretary}. Cannot create a ticket`,
      );
    }

    const directorCount = await User.count({
      where: { companyId: ticket.companyId, role: UserRole.director },
    });
    if (directorCount > 1) {
      throw new AccountingTicketError(
        'multiple directors found for the company',
      );
    }

    const existingRegTicket = await Ticket.count({
      where: {
        companyId: ticket.companyId,
        type: TicketType.registrationAddressChange,
      },
    });
    if (existingRegTicket > 0) {
      throw new AccountingTicketError('a record already exists');
    }
  }

  async create(ticket: CreateTicketDto): Promise<TicketDto> {
    await this.validate(ticket);

    let assignee = await User.findOne({
      where: {
        companyId: ticket.companyId,
        role: UserRole.corporateSecretary,
      },
    });

    if (!assignee) {
      assignee = await User.findOne({
        where: { companyId: ticket.companyId, role: UserRole.director },
      });
      if (!assignee) {
        throw new AccountingTicketError('Cannot find assignee for the ticket');
      }
    }

    const ticketDb = await Ticket.create({
      type: ticket.type,
      category: ticket.category,
      companyId: ticket.companyId,
      assigneeId: assignee.id,
      status: ticket.status,
    });

    return this.mapToDto(ticketDb);
  }
}
