import { extendApi } from '@anatine/zod-openapi';
import z from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';
import { TicketCategory, TicketStatus, TicketType } from '../ticket.model';

export const CreateTicketRequestZ = extendApi(
  z.object({
    type: extendApi(z.nativeEnum(TicketType), {
      description: 'Report type',
    }),
    companyId: extendApi(z.number(), {
      description: 'Company ID',
    }),
    category: extendApi(z.nativeEnum(TicketCategory), {
      description: 'Category',
    }),
    status: extendApi(z.nativeEnum(TicketStatus), {}),
  }),
);

export class CreateTicketRequest extends createZodDto(CreateTicketRequestZ) {}
