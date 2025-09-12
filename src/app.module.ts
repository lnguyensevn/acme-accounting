import { Module } from '@nestjs/common';
import { DbModule } from './db.module';
import { HealthcheckController } from './healthcheck/healthcheck.controller';
import { ReportApiModule } from './reports/apis/report-api.module';
import { TicketApiModule } from './tickets/apis/ticket-api.module';
import { UsersApiModule } from './users/apis/user-api.module';

@Module({
  imports: [DbModule, ReportApiModule, TicketApiModule, UsersApiModule],
  controllers: [HealthcheckController],
  providers: [],
})
export class AppModule {}
