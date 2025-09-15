import {
  Controller,
  Get,
  Post,
  HttpCode,
  Query,
  Body,
  Logger,
  HttpException,
  UsePipes,
} from '@nestjs/common';
import { ReportService } from '../report.service';
import {
  GenerateReportsRequest,
  GenerateReportsResponse,
  GetReportsResponse,
} from './report-api.view';
import { ReportType } from '../libs/report.type';
import { ZodValidationPipe } from '@anatine/zod-nestjs';

@Controller('api/v1')
@UsePipes(ZodValidationPipe)
export class ReportApiController {
  constructor(private reportsService: ReportService) {}

  @Get('/reports')
  report(@Query('types') types: string | undefined): GetReportsResponse {
    try {
      const reqTypes = types
        ? (types.split(',').map((type) => type.trim()) as ReportType[])
        : Object.values(ReportType);
      return this.reportsService.get({
        types: reqTypes,
      });
    } catch (error) {
      Logger.error('Error fetching reports:', error);
      if (error instanceof Error) {
        throw new HttpException(error.message, 500);
      }
      throw new HttpException('Service unavailable', 503);
    }
  }

  @Post('/reports')
  @HttpCode(201)
  async generate(
    @Body() body: GenerateReportsRequest,
  ): Promise<GenerateReportsResponse> {
    try {
      const types = body.types ? body.types : Object.values(ReportType);
      this.reportsService.generate({ types }).catch((error) => {
        if (error instanceof Error) {
          Logger.warn('During report generation:', error);
        } else {
          Logger.error('Unknown error during report generation:', error);
        }
      });
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(0);
        }, 200);
      });
      return this.reportsService.get({ types });
    } catch (error) {
      Logger.error('Error generating reports:', error);
      if (error instanceof Error) {
        throw new HttpException(error.message, 500);
      }
      throw new HttpException('Service unavailable', 503);
    }
  }
}
