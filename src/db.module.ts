import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SequelizeModuleOptions } from '@nestjs/sequelize/dist/interfaces/sequelize-options.interface';
import { Company } from './companies/company.model';
import { Ticket } from './tickets/ticket.model';
import { User } from './users/user.model';
import dbConfig from '../db/config/config.json';

const devConfig = dbConfig.development as SequelizeModuleOptions;
const testConfig = dbConfig.test as SequelizeModuleOptions;

const config = process.env.NODE_ENV === 'test' ? testConfig : devConfig;

@Module({
  imports: [
    SequelizeModule.forRoot({
      ...config,
      models: [Company, User, Ticket],
    }),
  ],
})
export class DbModule {}
