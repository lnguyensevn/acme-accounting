import { extendApi } from '@anatine/zod-openapi';
import z from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';
import { TicketCategory, TicketStatus, TicketType } from '../ticket.model';
import { PaginationRequest } from '../../common/type';

export class GetTicketsRequest extends PaginationRequest {}

const GetTicketsResponseZ = extendApi(
  z.object({
    total: extendApi(z.number(), { description: 'Total tickets' }),
    current: extendApi(z.number(), { description: 'Current page' }),
    pageSize: extendApi(z.number(), { description: 'Page size' }),
    data: extendApi(
      z.array(
        z.object({
          id: extendApi(z.number(), { description: 'Ticket ID' }),
          type: extendApi(z.nativeEnum(TicketType), {
            description: 'Report type',
          }),
          companyId: extendApi(z.number(), {
            description: 'Company ID',
          }),
          assigneeId: extendApi(z.number(), {
            description: 'Assignee ID',
          }),
          category: extendApi(z.nativeEnum(TicketCategory), {
            description: 'Category',
          }),
          status: extendApi(z.nativeEnum(TicketStatus), {
            description: 'Status',
          }),
        }),
      ),
      { description: 'List of tickets' },
    ),
  }),
  { description: 'Paginated list of tickets' },
);
export class GetTicketsResponse extends createZodDto(GetTicketsResponseZ) {}

const CreateTicketRequestZ = extendApi(
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

const CreateTicketResponseZ = extendApi(
  z.object({
    id: extendApi(z.number(), { description: 'Ticket ID' }),
    type: extendApi(z.nativeEnum(TicketType), {
      description: 'Report type',
    }),
    companyId: extendApi(z.number(), {
      description: 'Company ID',
    }),
    assigneeId: extendApi(z.number(), {
      description: 'Assignee ID',
    }),
    category: extendApi(z.nativeEnum(TicketCategory), {
      description: 'Category',
    }),
    status: extendApi(z.nativeEnum(TicketStatus), {
      description: 'Status',
    }),
  }),
);
export class CreateTicketResponse extends createZodDto(CreateTicketResponseZ) {}