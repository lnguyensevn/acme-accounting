import {
  Body,
  Controller,
  Get,
  HttpException,
  Logger,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';
import { TicketService } from '../ticket.service';
import { ZodValidationPipe } from '@anatine/zod-nestjs';
import {
  CreateTicketRequest,
  CreateTicketResponse,
  GetTicketsResponse,
} from './ticket-api.view';

@Controller('api/v1')
@UsePipes(ZodValidationPipe)
export class TicketApiController {
  constructor(private readonly service: TicketService) {}

  @Get('/tickets')
  async list(
    @Query('current') current: string = '1',
    @Query('pageSize') pageSize: string = '20',
  ): Promise<GetTicketsResponse> {
    try {
      return await this.service.list({
        current: parseInt(current, 10),
        pageSize: parseInt(pageSize, 10),
      });
    } catch (error) {
      Logger.error('Error fetching tickets:', error);
      if (error instanceof Error) {
        throw new HttpException(error.message, 500);
      }
      throw new HttpException('Service unavailable', 503);
    }
  }

  @Post('/tickets')
  async create(
    @Body() request: CreateTicketRequest,
  ): Promise<CreateTicketResponse> {
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
