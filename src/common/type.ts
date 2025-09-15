import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import z from 'zod';

export interface PaginationParamiters {
  current?: number;
  pageSize?: number;
}

export interface PaginationResult<R> {
  total: number;
  current: number;
  pageSize: number;
  data: R[];
}

export const PaginationRequestZ = extendApi(
  z.object({
    current: extendApi(z.number().optional(), { description: 'Current page' }),
    pageSize: extendApi(z.number().optional(), {
      description: 'Pay size',
    }),
  }),
);
export class PaginationRequest extends createZodDto(PaginationRequestZ) {}
