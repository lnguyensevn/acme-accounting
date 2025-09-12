import { Module } from '@nestjs/common';
import { TicketModule } from '../ticket.module';
import { TicketApiController } from './ticket-api.controller';

@Module({
  imports: [TicketModule],
  controllers: [TicketApiController],
})
export class TicketApiModule {}
