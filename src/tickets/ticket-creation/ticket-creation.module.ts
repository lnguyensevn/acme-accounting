import { Module } from '@nestjs/common';
import { ManagementReportService } from './report-management.service';
import { ChangeAddressService } from './change-address.service';
import { StrikeOffService } from './strike-off.service';

@Module({
  providers: [ManagementReportService, ChangeAddressService, StrikeOffService],
  exports: [ManagementReportService, ChangeAddressService, StrikeOffService],
})
export class TicketsCreationModule {}
