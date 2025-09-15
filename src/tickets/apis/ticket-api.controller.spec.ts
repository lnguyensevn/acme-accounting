import { Test, TestingModule } from '@nestjs/testing';
import { TicketCategory, TicketStatus, TicketType } from '../ticket.model';
import { UserRole } from '../../users/user.model';
import { TicketApiController } from './ticket-api.controller';
import { HttpException } from '@nestjs/common';
import { TicketService } from '../ticket.service';
import { TicketDto } from '../libs/tickets.types';
import { AccountingTicketError } from '../../common/error';

const managementTicket: TicketDto = {
  id: 1,
  type: TicketType.managementReport,
  category: TicketCategory.accounting,
  status: TicketStatus.open,
  assigneeId: 1,
  companyId: 1,
};

const changeAddressTicket: TicketDto = {
  id: 2,
  type: TicketType.registrationAddressChange,
  category: TicketCategory.corporate,
  status: TicketStatus.open,
  assigneeId: 1,
  companyId: 1,
};

const strikeOffTicket: TicketDto = {
  id: 3,
  type: TicketType.strikeOff,
  category: TicketCategory.management,
  status: TicketStatus.open,
  assigneeId: 1,
  companyId: 1,
};

describe('TicketsController', () => {
  let controller: TicketApiController;
  let ticketService: TicketService;
  let ticketMock: TicketDto;

  beforeEach(async () => {
    ticketService = {
      list: jest.fn(),
      createTicket: jest.fn(),
    } as unknown as TicketService;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketApiController],
      providers: [{ provide: TicketService, useValue: ticketService }],
    }).compile();

    controller = module.get<TicketApiController>(TicketApiController);
  });

  it('Should be defined', async () => {
    expect(controller).toBeDefined();

    const res = await controller.list();
    console.log(res);
  });

  describe('Create', () => {
    describe('Management report', () => {
      it('Creates nanagement report ticket successfully', async () => {
        ticketMock = managementTicket;
        jest.spyOn(ticketService, 'createTicket').mockResolvedValue(ticketMock);

        const ticket = await controller.create({
          companyId: 1,
          type: TicketType.managementReport,
          category: TicketCategory.accounting,
          status: TicketStatus.open,
        });

        expect(ticket.category).toBe(TicketCategory.accounting);
        expect(ticket.assigneeId).toBe(ticketMock.assigneeId);
        expect(ticket.status).toBe(TicketStatus.open);
      });

      it('if there are multiple accountants, assign the last one successfully', async () => {
        ticketMock = managementTicket;
        jest.spyOn(ticketService, 'createTicket').mockResolvedValue(ticketMock);

        const ticket = await controller.create({
          companyId: 1,
          type: TicketType.managementReport,
          category: TicketCategory.accounting,
          status: TicketStatus.open,
        });

        expect(ticket.category).toBe(TicketCategory.accounting);
        expect(ticket.assigneeId).toBe(ticketMock.assigneeId);
        expect(ticket.status).toBe(TicketStatus.open);
      });

      it('if there is no accountant, throw error', async () => {
        jest
          .spyOn(ticketService, 'createTicket')
          .mockRejectedValue(
            new AccountingTicketError(
              'Cannot find user with role accountant to create a ticket',
            ),
          );

        const createTicket = controller.create({
          companyId: 1,
          type: TicketType.managementReport,
          category: TicketCategory.accounting,
          status: TicketStatus.open,
        });

        await expect(createTicket).rejects.toThrow(HttpException);
        await expect(createTicket).rejects.toMatchObject({
          message: 'Cannot find user with role accountant to create a ticket',
          status: 500,
        });
      });
    });

    describe('Registration address change', () => {
      it('Creates registration address change ticket successfully', async () => {
        ticketMock = changeAddressTicket;
        jest.spyOn(ticketService, 'createTicket').mockResolvedValue(ticketMock);

        const ticket = await controller.create({
          companyId: 1,
          type: TicketType.registrationAddressChange,
          category: TicketCategory.corporate,
          status: TicketStatus.open,
        });

        expect(ticket.category).toBe(TicketCategory.corporate);
        expect(ticket.assigneeId).toBe(1);
        expect(ticket.status).toBe(TicketStatus.open);
      });

      it('If there are multiple secretaries, throw error', async () => {
        jest
          .spyOn(ticketService, 'createTicket')
          .mockRejectedValue(
            new AccountingTicketError(
              `Multiple users with role ${UserRole.corporateSecretary}. Cannot create a ticket`,
            ),
          );

        const createTicket = controller.create({
          companyId: 1,
          type: TicketType.registrationAddressChange,
          category: TicketCategory.corporate,
          status: TicketStatus.open,
        });

        await expect(createTicket).rejects.toThrow(HttpException);
        await expect(createTicket).rejects.toMatchObject({
          message: `Multiple users with role corporateSecretary. Cannot create a ticket`,
          status: 500,
        });
      });

      it('If there is no secretary, throw error', async () => {
        jest
          .spyOn(ticketService, 'createTicket')
          .mockRejectedValue(
            new AccountingTicketError('Cannot find assignee for the ticket'),
          );

        const createTicket = controller.create({
          companyId: 1,
          type: TicketType.registrationAddressChange,
          category: TicketCategory.corporate,
          status: TicketStatus.open,
        });

        await expect(createTicket).rejects.toThrow(HttpException);
        await expect(createTicket).rejects.toMatchObject({
          status: 500,
          message: 'Cannot find assignee for the ticket',
        });
      });

      it('If there are multiple directors, throw error', async () => {
        jest
          .spyOn(ticketService, 'createTicket')
          .mockRejectedValue(
            new AccountingTicketError(
              `Multiple users with role ${UserRole.director}. Cannot create a ticket`,
            ),
          );

        const createTicket = controller.create({
          companyId: 1,
          type: TicketType.registrationAddressChange,
          category: TicketCategory.corporate,
          status: TicketStatus.open,
        });

        await expect(createTicket).rejects.toThrow(HttpException);
        await expect(createTicket).rejects.toMatchObject({
          message: 'Multiple users with role director. Cannot create a ticket',
          status: 500,
        });
      });

      it('If there are multiple ticket with same change address type, throw dupplication error', async () => {
        jest
          .spyOn(ticketService, 'createTicket')
          .mockRejectedValue(
            new AccountingTicketError('The ticket already exists'),
          );

        const createTicket = controller.create({
          companyId: 1,
          type: TicketType.registrationAddressChange,
          category: TicketCategory.corporate,
          status: TicketStatus.open,
        });

        await expect(createTicket).rejects.toThrow(HttpException);
        await expect(createTicket).rejects.toMatchObject({
          message: 'The ticket already exists',
          status: 500,
        });
      });
    });

    describe('Strike off', () => {
      it('Creates strike off ticket successfully', async () => {
        ticketMock = strikeOffTicket;
        jest.spyOn(ticketService, 'createTicket').mockResolvedValue(ticketMock);

        const ticket = await controller.create({
          companyId: 1,
          type: TicketType.strikeOff,
          category: TicketCategory.management,
          status: TicketStatus.open,
        });

        expect(ticket.category).toBe(TicketCategory.management);
        expect(ticket.assigneeId).toBe(ticketMock.assigneeId);
        expect(ticket.status).toBe(TicketStatus.open);
      });

      it('if there is no director found, throw error', async () => {
        jest
          .spyOn(ticketService, 'createTicket')
          .mockRejectedValue(
            new AccountingTicketError('No director found for the company'),
          );

        const createTicket = controller.create({
          companyId: 1,
          type: TicketType.strikeOff,
          category: TicketCategory.management,
          status: TicketStatus.open,
        });

        await expect(createTicket).rejects.toThrow(HttpException);
        await expect(createTicket).rejects.toMatchObject({
          message: 'No director found for the company',
          status: 500,
        });
      });
    });
  });
});
