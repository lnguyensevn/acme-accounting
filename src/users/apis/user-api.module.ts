import { Module } from '@nestjs/common';
import { UserApiController } from './user-api.controller';
import { UserModule } from '../user.module';

@Module({
  imports: [UserModule],
  controllers: [UserApiController],
})
export class UsersApiModule {}
