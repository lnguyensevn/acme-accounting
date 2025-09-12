import { Injectable } from '@nestjs/common';
import { TicketCreation } from '../libs/tickets.creation';
import { CreateTicketDto, TicketDto } from '../libs/tickets.types';
import {
  Ticket,
  TicketCategory,
  TicketStatus,
  TicketType,
} from '../ticket.model';
import { User, UserRole } from '../../users/user.model';
import { Company, CompanyStatus } from '../../companies/company.model';

@Injectable()
export class StrikeOffService extends TicketCreation {
  constructor() {
    super();
  }

  protected async validate(ticket: CreateTicketDto): Promise<void> {
    if (ticket.type !== TicketType.strikeOff) {
      throw new Error('Invalid ticket type');
    }
    if (ticket.category !== TicketCategory.management) {
      throw new Error('Invalid ticket category');
    }

    const directorCount = await User.count({
      where: { companyId: ticket.companyId, role: UserRole.director },
    });
    if (directorCount <= 0) {
      throw new Error('No director found for the company');
    }
  }

  async create(ticket: CreateTicketDto): Promise<TicketDto> {
    await this.validate(ticket);

    const director = await User.findOne({
      where: { companyId: ticket.companyId, role: UserRole.director },
      order: [['createdAt', 'DESC']],
    });

    if (!director) {
      throw new Error('No director found for the company');
    }
    const sequelize = User.sequelize;
    if (!sequelize) {
      throw new Error('Sequelize instance not found');
    }

    const transaction = await sequelize.transaction();

    try {
      await Company.update(
        { status: CompanyStatus.inactive },
        { where: { id: ticket.companyId }, transaction },
      );

      // TODO: this will cause a performance problem if thre are
      // several task was created for the same company
      await Ticket.update(
        { status: TicketStatus.deleted },
        {
          where: {
            companyId: ticket.companyId,
          },
          transaction,
        },
      );

      const ticketDb = await Ticket.create(
        {
          type: ticket.type,
          category: ticket.category,
          companyId: ticket.companyId,
          assigneeId: director.id,
          status: TicketStatus.deleted,
        },
        { transaction },
      );
      await transaction.commit();

      return this.mapToDto(ticketDb);
    } catch (error) {
      if (transaction) await transaction.rollback();
      throw error;
    }
  }
}
