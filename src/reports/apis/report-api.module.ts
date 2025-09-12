import { Module } from '@nestjs/common';
import { ReportApiController } from './report-api.controller';
import { ReportModule } from '../report.module';

@Module({
  imports: [ReportModule],
  controllers: [ReportApiController],
})
export class ReportApiModule {}
