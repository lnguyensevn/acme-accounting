import { extendApi } from '@anatine/zod-openapi';
import z from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';
import { ReportType } from '../libs/report.type';

export const GetReportsResponseZ = extendApi(
  z.object({
    types: extendApi(z.nativeEnum(ReportType).array().optional(), {
      description: 'Report type to filter by',
    }),
  }),
);

export class GetReportsRequest extends createZodDto(GetReportsResponseZ) {}

export const GenerateReportsRequestZ = extendApi(
  z.object({
    types: extendApi(z.nativeEnum(ReportType).array().optional(), {
      description: 'Report type to filter by',
    }),
  }),
);

export class GenerateReportsRequest extends createZodDto(
  GenerateReportsRequestZ,
) {}
