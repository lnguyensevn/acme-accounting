import {
  Body,
  Controller,
  Get,
  HttpException,
  Logger,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';
import { UserService } from '../user.service';
import {
  CreateUserRequest,
  CreateUserResponse,
  GetUsersResponse,
} from './user-api.view';
import { ZodValidationPipe } from '@anatine/zod-nestjs';
import { AccountingUserError } from '../../common/error';

@Controller('api/v1')
@UsePipes(ZodValidationPipe)
export class UserApiController {
  constructor(private readonly usersService: UserService) {}
  @Get('/users')
  async list(
    @Query('current') current: string = '1',
    @Query('pageSize') size: string = '20',
  ): Promise<GetUsersResponse> {
    try {
      return await this.usersService.list({
        current: parseInt(current, 10),
        pageSize: parseInt(size, 10),
      });
    } catch (error) {
      Logger.error('Error fetching users:', error);
      if (error instanceof AccountingUserError) {
        throw new HttpException(error.message, 500);
      }
      throw new HttpException('Service unavailable', 503);
    }
  }

  @Post('/users')
  async create(
    @Body() newUser: CreateUserRequest,
  ): Promise<CreateUserResponse> {
    try {
      return await this.usersService.create({
        name: newUser.name,
        role: newUser.role,
        companyId: newUser.companyId,
      });
    } catch (error) {
      Logger.error('Error creating user:', error);
      if (error instanceof AccountingUserError) {
        throw new HttpException(error.message, 500);
      }
      throw new HttpException('Service unavailable', 503);
    }
  }
}
