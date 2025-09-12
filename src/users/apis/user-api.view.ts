import { extendApi } from '@anatine/zod-openapi';
import z from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';
import { UserRole } from '../user.model';

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
