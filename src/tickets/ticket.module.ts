import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { ManagementReportService } from './ticket-creation/report-management.service';
import { ChangeAddressService } from './ticket-creation/change-address.service';
import { StrikeOffService } from './ticket-creation/strike-off.service';
import { TicketsCreationModule } from './ticket-creation/ticket-creation.module';

@Module({
  imports: [TicketsCreationModule],
  providers: [
    {
      provide: TicketService,
      useFactory: (
        management: ManagementReportService,
        changeAddress: ChangeAddressService,
        strikeOff: StrikeOffService,
      ) => {
        return new TicketService(management, changeAddress, strikeOff);
      },
      inject: [ManagementReportService, ChangeAddressService, StrikeOffService],
    },
  ],
  exports: [TicketService],
})
export class TicketModule {}
