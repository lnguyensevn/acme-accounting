import { Test, TestingModule } from '@nestjs/testing';
import { Company } from '../../companies/company.model';
import { TicketCategory, TicketStatus, TicketType } from '../ticket.model';
import { User, UserRole } from '../../users/user.model';
import { DbModule } from '../../db.module';
import { TicketApiController } from './ticket-api.controller';
import { HttpException, InternalServerErrorException } from '@nestjs/common';
import { TicketModule } from '../ticket.module';

describe('TicketsController', () => {
  let controller: TicketApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketApiController],
      imports: [DbModule, TicketModule],
    }).compile();

    controller = module.get<TicketApiController>(TicketApiController);
  });

  it('should be defined', async () => {
    expect(controller).toBeDefined();

    const res = await controller.findAll();
    console.log(res);
  });

  describe('create', () => {
    describe('managementReport', () => {
      it('creates managementReport ticket', async () => {
        const company = await Company.create({ name: 'test' });
        const user = await User.create({
          name: 'Test User',
          role: UserRole.accountant,
          companyId: company.id,
        });

        const ticket = await controller.create({
          companyId: company.id,
          type: TicketType.managementReport,
          category: TicketCategory.accounting,
          status: TicketStatus.open,
        });

        expect(ticket.category).toBe(TicketCategory.accounting);
        expect(ticket.assigneeId).toBe(user.id);
        expect(ticket.status).toBe(TicketStatus.open);
      });

      it('if there are multiple accountants, assign the last one', async () => {
        const company = await Company.create({ name: 'test' });
        await User.create({
          name: 'Test User',
          role: UserRole.accountant,
          companyId: company.id,
        });
        const user2 = await User.create({
          name: 'Test User',
          role: UserRole.accountant,
          companyId: company.id,
        });

        const ticket = await controller.create({
          companyId: company.id,
          type: TicketType.managementReport,
          category: TicketCategory.accounting,
          status: TicketStatus.open,
        });

        expect(ticket.category).toBe(TicketCategory.accounting);
        expect(ticket.assigneeId).toBe(user2.id);
        expect(ticket.status).toBe(TicketStatus.open);
      });

      it('if there is no accountant, throw', async () => {
        const company = await Company.create({ name: 'test' });

        await expect(
          controller.create({
            companyId: company.id,
            type: TicketType.managementReport,
            category: TicketCategory.accounting,
            status: TicketStatus.open,
          }),
        ).rejects.toEqual(
          new InternalServerErrorException(
            `Cannot find user with role accountant to create a ticket`,
          ),
        );
      });
    });

    describe('registrationAddressChange', () => {
      it('creates registrationAddressChange ticket', async () => {
        const company = await Company.create({ name: 'test' });
        const user = await User.create({
          name: 'Test User',
          role: UserRole.corporateSecretary,
          companyId: company.id,
        });

        const ticket = await controller.create({
          companyId: company.id,
          type: TicketType.registrationAddressChange,
          category: TicketCategory.corporate,
          status: TicketStatus.open,
        });

        expect(ticket.category).toBe(TicketCategory.corporate);
        expect(ticket.assigneeId).toBe(user.id);
        expect(ticket.status).toBe(TicketStatus.open);
      });

      it('if there are multiple secretaries, throw', async () => {
        const company = await Company.create({ name: 'test' });
        await User.create({
          name: 'Test User',
          role: UserRole.corporateSecretary,
          companyId: company.id,
        });
        await User.create({
          name: 'Test User',
          role: UserRole.corporateSecretary,
          companyId: company.id,
        });

        await expect(
          controller.create({
            companyId: company.id,
            type: TicketType.registrationAddressChange,
            category: TicketCategory.corporate,
            status: TicketStatus.open,
          }),
        ).rejects.toEqual(
          new HttpException(
            `Multiple users with role corporateSecretary. Cannot create a ticket`,
            500,
          ),
        );
      });

      it('if there is no secretary, throw', async () => {
        const company = await Company.create({ name: 'test' });

        await expect(
          controller.create({
            companyId: company.id,
            type: TicketType.registrationAddressChange,
            category: TicketCategory.corporate,
            status: TicketStatus.open,
          }),
        ).rejects.toEqual(
          new InternalServerErrorException(
            `Cannot find user with role corporateSecretary to create a ticket`,
          ),
        );
      });
    });
  });
});
