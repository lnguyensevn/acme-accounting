import { Ticket } from '../ticket.model';
import { CreateTicketDto, TicketDto } from './tickets.types';

export abstract class TicketCreation {
  abstract create(ticket: CreateTicketDto): Promise<TicketDto>;
  protected abstract validate(ticket: CreateTicketDto): Promise<void>;
  protected mapToDto(ticket: Ticket): TicketDto {
    return {
      id: ticket.id,
      type: ticket.type,
      assigneeId: ticket.assigneeId,
      status: ticket.status,
      category: ticket.category,
      companyId: ticket.companyId,
    };
  }
}
