import {
  Body,
  Controller,
  Get,
  HttpException,
  Logger,
  Post,
  UsePipes,
} from '@nestjs/common';
import { Company } from '../../companies/company.model';
import { Ticket } from '../ticket.model';
import { User } from '../../users/user.model';
import { TicketService } from '../ticket.service';
import { ZodValidationPipe } from '@anatine/zod-nestjs';
import { CreateTicketRequest } from './ticket-api.view';

@Controller('api/v1')
@UsePipes(ZodValidationPipe)
export class TicketApiController {
  constructor(private readonly service: TicketService) {}

  @Get('/tickets')
  async findAll() {
    try {
      return await Ticket.findAll({ include: [Company, User] });
    } catch (error) {
      Logger.error('Error fetching tickets:', error);
      if (error instanceof Error) {
        throw new HttpException(error.message, 500);
      }
      throw new HttpException('Service unavailable', 503);
    }
  }

  @Post('/tickets')
  async create(@Body() request: CreateTicketRequest) {
    try {
      return await this.service.createTicket({
        type: request.type,
        companyId: request.companyId,
        category: request.category,
        status: request.status,
      });
    } catch (error) {
      Logger.error('Error creating ticket:', error);
      if (error instanceof Error) {
        throw new HttpException(error.message, 500);
      }
      throw new HttpException('Service unavailable', 503);
    }
  }
}
