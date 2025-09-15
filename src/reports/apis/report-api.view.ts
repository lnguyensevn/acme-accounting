import { extendApi } from '@anatine/zod-openapi';
import z from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';
import { ReportType } from '../libs/report.type';

export const GetReportsRequestZ = extendApi(
  z.object({
    types: extendApi(z.nativeEnum(ReportType).array().optional(), {
      description: 'Report type to filter by',
    }),
  }),
);
export class GetReportsRequest extends createZodDto(GetReportsRequestZ) {}

const ReportResultZ = extendApi(
  z
    .object({
      status: extendApi(z.string(), {
        description: 'Status of the accounts report',
      }),
      metrics: extendApi(
        z
          .object({
            dataFetchingTimeTaken: extendApi(z.number().optional(), {
              description: 'Time taken to fetch data',
            }),
            dataWriteTimeTaken: extendApi(z.number().optional(), {
              description: 'Time taken to write data to the report file',
            }),
            totalTimeTaken: extendApi(z.number().optional(), {
              description: 'total time taken to generate the accounts report',
            }),
            generatedAt: extendApi(z.date().optional(), {
              description: 'Time when report was generated in seconds',
            }),
          })
          .optional(),
        {
          description: 'Metrics related to the accounts report',
        },
      ),
    })
    .optional(),
  {
    description: 'Accounts report status and metrics',
  },
);
export const GetReportsResponseZ = extendApi(
  z.object({
    accounts: ReportResultZ,
    yearly: ReportResultZ,
    fs: ReportResultZ,
  }),
  {
    description: 'Report type to filter by',
  },
);
export class GetReportsResponse extends createZodDto(GetReportsResponseZ) {}

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

export const GenerateReportsResponseZ = extendApi(
  z.object({
    accounts: ReportResultZ,
    yearly: ReportResultZ,
    fs: ReportResultZ,
  }),
  {
    description: 'Report type to filter by',
  },
);
export class GenerateReportsResponse extends createZodDto(
  GenerateReportsResponseZ,
) {}
