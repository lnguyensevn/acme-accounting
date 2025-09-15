import { Injectable, Logger } from '@nestjs/common';
import { TicketCreation } from '../libs/tickets.creation';
import { CreateTicketDto, TicketDto } from '../libs/tickets.types';
import {
  Ticket,
  TicketCategory,
  TicketStatus,
  TicketType,
} from '../ticket.model';
import { User, UserRole, UserStatus } from '../../users/user.model';
import { Company, CompanyStatus } from '../../companies/company.model';
import { AccountingTicketError } from '../../common/error';
import moment from 'moment';

@Injectable()
export class StrikeOffService extends TicketCreation {
  private readonly queue: {
    type: 'user' | 'company' | 'ticket';
    start?: Date;
    end?: Date;
    companyId?: number;
    id?: number;
  }[] = [];
  constructor() {
    super();
  }

  protected async validate(ticket: CreateTicketDto): Promise<void> {
    if (ticket.type !== TicketType.strikeOff) {
      throw new AccountingTicketError('Invalid ticket type');
    }
    if (ticket.category !== TicketCategory.management) {
      throw new AccountingTicketError('Invalid ticket category');
    }

    const directorCount = await User.count({
      where: { companyId: ticket.companyId, role: UserRole.director },
    });
    if (directorCount <= 0) {
      throw new AccountingTicketError('No director found for the company');
    }
  }

  async create(ticket: CreateTicketDto): Promise<TicketDto> {
    await this.validate(ticket);

    const director = await User.findOne({
      where: { companyId: ticket.companyId, role: UserRole.director },
      order: [['createdAt', 'DESC']],
    });

    if (!director) {
      throw new AccountingTicketError('No director found for the company');
    }

    const company = await Company.findOne({
      where: { id: ticket.companyId },
    });
    if (!company) {
      throw new AccountingTicketError(
        'No existing tickets found for the company',
      );
    }

    const ticketDb = await Ticket.create({
      type: ticket.type,
      category: ticket.category,
      companyId: ticket.companyId,
      assigneeId: director.id,
      status: TicketStatus.open,
    });

    const endDate = moment();
    let startDate = moment(company.created_at);
    const monthlyChunks: { start: Date; end: Date }[] = [];

    while (startDate.isBefore(endDate)) {
      const monthEnd = moment(startDate).endOf('month');
      monthlyChunks.push({
        start: moment(startDate).startOf('d').toDate(),
        end: monthEnd.endOf('d').toDate(),
      });
      startDate = monthEnd.add(1, 'day');
    }

    for (const chunk of monthlyChunks) {
      this.queue.push({
        type: 'user',
        companyId: ticket.companyId,
        start: chunk.start,
        end: chunk.end,
      });
      this.queue.push({
        type: 'ticket',
        companyId: ticket.companyId,
        start: chunk.start,
        end: chunk.end,
      });
    }
    this.queue.push({ type: 'company', companyId: ticket.companyId });
    this.execute().catch((err) => {
      Logger.error('Error processing strike off queue:', err);
    });
    return this.mapToDto(ticketDb);
  }

  private async execute(): Promise<void> {
    const firstItem = this.queue.shift();
    if (!firstItem) {
      return;
    }

    const { type, start, end, companyId } = firstItem;
    switch (type) {
      case 'user':
        if (!start || !end || !companyId) {
          throw new AccountingTicketError('Invalid queue item');
        }
        await this.deactivateUsers(companyId, start, end);
        break;
      case 'company':
        if (!companyId) {
          throw new AccountingTicketError('Invalid queue item');
        }
        await this.deactivateCompany(companyId);
        break;
      case 'ticket':
        if (!start || !end || !companyId) {
          throw new AccountingTicketError('Invalid queue item');
        }
        await this.deleteTickets(companyId, start, end);
        break;
    }

    if (this.queue.length > 0) {
      await this.execute();
    }
  }

  private async deactivateCompany(companyId: number): Promise<void> {
    await Company.update(
      { status: CompanyStatus.inactive },
      {
        where: {
          id: companyId,
        },
      },
    );
  }

  private async deleteTickets(
    companyId: number,
    start: Date,
    end: Date,
  ): Promise<void> {
    await Ticket.update(
      { status: TicketStatus.deleted },
      {
        where: {
          companyId,
          createdAt: {
            $gte: start,
            $lte: end,
          },
        },
      },
    );
  }

  private async deactivateUsers(
    companyId: number,
    start: Date,
    end: Date,
  ): Promise<void> {
    await User.update(
      { status: UserStatus.inactive },
      {
        where: {
          companyId,
          createdAt: {
            $gte: start,
            $lte: end,
          },
        },
      },
    );
  }
}
