import { extendApi } from '@anatine/zod-openapi';
import z from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';
import { UserRole } from '../user.model';
import { PaginationRequest } from '../../common/type';

export const CreateUserRequestZ = extendApi(
  z.object({
    role: extendApi(z.nativeEnum(UserRole), {
      description: 'Role of the user',
    }),
    name: extendApi(z.string(), {
      description: 'Name of the user',
    }),
    companyId: extendApi(z.number(), {
      description: 'ID of the company the user belongs to',
    }),
  }),
);
export class CreateUserRequest extends createZodDto(CreateUserRequestZ) {}

export const CreateUserResponseZ = extendApi(
  z.object({
    id: extendApi(z.number(), { description: 'ID of the created user' }),
    role: extendApi(z.nativeEnum(UserRole), {
      description: 'Role of the user',
    }),
    name: extendApi(z.string(), {
      description: 'Name of the user',
    }),
    companyId: extendApi(z.number(), {
      description: 'ID of the company the user belongs to',
    }),
  }),
);
export class CreateUserResponse extends createZodDto(CreateUserRequestZ) {}

export class GetUserRequest extends PaginationRequest {}

const GetUsersResponseZ = extendApi(
  z.object({
    total: extendApi(z.number(), { description: 'Total tickets' }),
    current: extendApi(z.number(), { description: 'Current page' }),
    pageSize: extendApi(z.number(), { description: 'Page size' }),
    data: extendApi(
      z.array(
        z.object({
          id: extendApi(z.number(), { description: 'Ticket ID' }),
          role: extendApi(z.nativeEnum(UserRole), {
            description: 'Role of the user',
          }),
          name: extendApi(z.string(), {
            description: 'Name of the user',
          }),
          companyId: extendApi(z.number(), {
            description: 'ID of the company the user belongs to',
          }),
        }),
      ),
      { description: 'List of tickets' },
    ),
  }),
  { description: 'Paginated list of tickets' },
);
export class GetUsersResponse extends createZodDto(GetUsersResponseZ) {}
