import { Injectable } from '@nestjs/common';
import { TicketCreation } from '../libs/tickets.creation';
import { CreateTicketDto, TicketDto } from '../libs/tickets.types';
import { Ticket, TicketCategory, TicketType } from '../ticket.model';
import { User, UserRole } from '../../users/user.model';

@Injectable()
export class ChangeAddressService extends TicketCreation {
  constructor() {
    super();
  }

  protected async validate(ticket: CreateTicketDto): Promise<void> {
    if (ticket.type !== TicketType.registrationAddressChange) {
      throw new Error('Invalid ticket type');
    }
    if (ticket.category !== TicketCategory.corporate) {
      throw new Error('Invalid ticket category');
    }

    const secretaryCount = await User.count({
      where: {
        companyId: ticket.companyId,
        role: UserRole.corporateSecretary,
      },
    });
    if (secretaryCount > 1) {
      throw new Error(
        `Multiple users with role ${UserRole.corporateSecretary}. Cannot create a ticket`,
      );
    }

    const directorCount = await User.count({
      where: { companyId: ticket.companyId, role: UserRole.director },
    });
    if (directorCount > 1) {
      throw new Error('multiple directors found for the company');
    }

    const existingRegTicket = await Ticket.count({
      where: {
        companyId: ticket.companyId,
        type: TicketType.registrationAddressChange,
      },
    });
    if (existingRegTicket > 0) {
      throw new Error('a record already exists');
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
        throw new Error(
          'Cannot find user with role corporateSecretary to create a ticket',
        );
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
