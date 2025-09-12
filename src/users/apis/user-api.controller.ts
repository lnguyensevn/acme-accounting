import {
  Body,
  Controller,
  Get,
  HttpException,
  Logger,
  Post,
  UsePipes,
} from '@nestjs/common';
import { User } from '../user.model';
import { UserService } from '../user.service';
import { GetUserDto } from '../libs/users.types';
import { CreateUserRequest } from './user-api.view';
import { ZodValidationPipe } from '@anatine/zod-nestjs';

@Controller('api/v1')
@UsePipes(ZodValidationPipe)
export class UserApiController {
  constructor(private readonly usersService: UserService) {}
  @Get('/users')
  async findAll() {
    try {
      return await User.findAll();
    } catch (error) {
      Logger.error('Error fetching users:', error);
      if (error instanceof Error) {
        throw new HttpException(error.message, 500);
      }
      throw new HttpException('Service unavailable', 503);
    }
  }

  @Post('/users')
  async create(@Body() newUser: CreateUserRequest): Promise<GetUserDto> {
    try {
      return await this.usersService.createUser({
        name: newUser.name,
        role: newUser.role,
        companyId: newUser.companyId,
      });
    } catch (error) {
      Logger.error('Error creating user:', error);
      if (error instanceof Error) {
        throw new HttpException(error.message, 500);
      }
      throw new HttpException('Internal server error', 503);
    }
  }
}
