import { Test, TestingModule } from '@nestjs/testing';
import {
  Ticket,
  TicketCategory,
  TicketStatus,
  TicketType,
} from '../ticket.model';
import { AccountingTicketError } from '../../common/error';
import { User, UserRole } from '../../users/user.model';
import { ManagementReportService } from './report-management.service';

const successTicket = {
  type: TicketType.managementReport,
  category: TicketCategory.accounting,
  status: TicketStatus.open,
  companyId: 1,
  assigneeId: 1,
};

const expectedTicket = {
  type: TicketType.managementReport,
  category: TicketCategory.accounting,
  status: TicketStatus.open,
  companyId: 1,
  assigneeId: 1,
};

describe('ManagementReportService', () => {
  let reportManagement: ManagementReportService;
  let ticketMock: Ticket;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ManagementReportService],
    }).compile();

    reportManagement = module.get<ManagementReportService>(
      ManagementReportService,
    );
  });

  it('Should be defined', () => {
    expect(reportManagement).toBeDefined();
  });

  describe('Validate function', () => {
    it('When ticket type is invalid, throw exception', async () => {
      const ticketPromise = reportManagement.create({
        type: TicketType.registrationAddressChange,
        companyId: 1,
        status: TicketStatus.open,
        category: TicketCategory.accounting,
      });

      await expect(ticketPromise).rejects.toThrow(AccountingTicketError);
      await expect(ticketPromise).rejects.toMatchObject({
        message: 'Invalid ticket type',
      });
    });

    it('When category is invalid, throw exception', async () => {
      const ticketPromise = reportManagement.create({
        type: TicketType.managementReport,
        companyId: 1,
        status: TicketStatus.open,
        category: TicketCategory.corporate,
      });

      await expect(ticketPromise).rejects.toThrow(AccountingTicketError);
      await expect(ticketPromise).rejects.toMatchObject({
        message: 'Invalid ticket category',
      });
    });

    it('When there is no accountant, throw exception', async () => {
      jest.spyOn(User, 'count').mockImplementation(() => {
        return Promise.resolve(0);
      });

      const ticketPromise = reportManagement.create({
        type: TicketType.managementReport,
        companyId: 1,
        status: TicketStatus.open,
        category: TicketCategory.accounting,
      });

      await expect(ticketPromise).rejects.toThrow(AccountingTicketError);
      await expect(ticketPromise).rejects.toMatchObject({
        message: 'Cannot find user with role accountant to create a ticket',
      });
    });
  });

  describe('Create function', () => {
    it('When creating management report successfully', async () => {
      ticketMock = successTicket as Ticket;
      jest.spyOn(User, 'count').mockImplementation(() => {
        return Promise.resolve(1);
      });
      jest.spyOn(User, 'findOne').mockImplementationOnce(() => {
        return Promise.resolve({
          id: 1,
          name: 'Test User',
          role: UserRole.accountant,
          companyId: 1,
        } as User);
      });
      const create = jest.spyOn(Ticket, 'create').mockImplementation(() => {
        return Promise.resolve(ticketMock);
      });

      const ticket = await reportManagement.create({
        type: TicketType.managementReport,
        companyId: 1,
        status: TicketStatus.open,
        category: TicketCategory.accounting,
      });

      expect(ticket).toBeDefined();
      expect(create).toHaveBeenCalled();
      expect(create).toHaveBeenCalledTimes(1);
      expect(create).toHaveBeenCalledWith(expectedTicket);
      expect(ticket).toMatchObject(expectedTicket);
    });

    it('When creating management report, throw error', async () => {
      ticketMock = successTicket as Ticket;
      jest.spyOn(User, 'count').mockImplementation(() => {
        return Promise.resolve(1);
      });
      jest.spyOn(User, 'findOne').mockImplementationOnce(() => {
        return Promise.resolve(null);
      });

      const ticket = reportManagement.create({
        type: TicketType.managementReport,
        companyId: 1,
        status: TicketStatus.open,
        category: TicketCategory.accounting,
      });

      await expect(ticket).rejects.toThrow(AccountingTicketError);
      await expect(ticket).rejects.toMatchObject({
        message: 'Cannot find user with role accountant to create a ticket',
      });
    });
  });
});
