import { Test, TestingModule } from '@nestjs/testing';
import {
  Ticket,
  TicketCategory,
  TicketStatus,
  TicketType,
} from '../ticket.model';
import { AccountingTicketError } from '../../common/error';
import { User, UserRole } from '../../users/user.model';
import { StrikeOffService } from './strike-off.service';
import { Company } from '../../companies/company.model';

const successTicket = {
  type: TicketType.strikeOff,
  category: TicketCategory.management,
  status: TicketStatus.open,
  companyId: 1,
  assigneeId: 1,
};

const expectedTicket = {
  type: TicketType.strikeOff,
  category: TicketCategory.management,
  status: TicketStatus.open,
  companyId: 1,
  assigneeId: 1,
};

jest.mock('p-queue', () => {
  return {
    __esModule: true,
    default: class MockPQueue {
      add(fn: () => Promise<any>) {
        return fn();
      }
    },
  };
});

describe('StrikeOffService', () => {
  let strikeOff: StrikeOffService;
  let ticketMock: Ticket;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StrikeOffService],
    }).compile();

    strikeOff = module.get<StrikeOffService>(StrikeOffService);
  });

  it('Should be defined', () => {
    expect(strikeOff).toBeDefined();
  });

  describe('Validate function', () => {
    it('When ticket type is invalid, throw exception', async () => {
      const ticketPromise = strikeOff.create({
        type: TicketType.registrationAddressChange,
        companyId: 1,
        status: TicketStatus.open,
        category: TicketCategory.management,
      });

      await expect(ticketPromise).rejects.toThrow(AccountingTicketError);
      await expect(ticketPromise).rejects.toMatchObject({
        message: 'Invalid ticket type',
      });
    });

    it('When category is invalid, throw exception', async () => {
      const ticketPromise = strikeOff.create({
        type: TicketType.strikeOff,
        companyId: 1,
        status: TicketStatus.open,
        category: TicketCategory.corporate,
      });

      await expect(ticketPromise).rejects.toThrow(AccountingTicketError);
      await expect(ticketPromise).rejects.toMatchObject({
        message: 'Invalid ticket category',
      });
    });

    it('When there is no director found, throw exception', async () => {
      jest.spyOn(User, 'count').mockImplementationOnce(() => {
        return Promise.resolve(0);
      });

      const ticketPromise = strikeOff.create({
        type: TicketType.strikeOff,
        companyId: 1,
        status: TicketStatus.open,
        category: TicketCategory.management,
      });

      await expect(ticketPromise).rejects.toThrow(AccountingTicketError);
      await expect(ticketPromise).rejects.toMatchObject({
        message: 'No director found for the company',
      });
    });
  });

  describe('Create function', () => {
    it('When creating strike off ticket successfully', async () => {
      ticketMock = successTicket as Ticket;
      jest.spyOn(User, 'count').mockImplementation(() => {
        return Promise.resolve(1);
      });
      jest.spyOn(User, 'findOne').mockImplementationOnce(() => {
        return Promise.resolve({
          id: 1,
          name: 'Test User',
          role: UserRole.director,
          companyId: 1,
        } as User);
      });
      jest.spyOn(Company, 'findOne').mockImplementationOnce(() => {
        return Promise.resolve({
          name: 'Test User',
        } as Company);
      });
      const create = jest.spyOn(Ticket, 'create').mockImplementation(() => {
        return Promise.resolve(ticketMock);
      });

      const ticket = await strikeOff.create({
        type: TicketType.strikeOff,
        companyId: 1,
        status: TicketStatus.open,
        category: TicketCategory.management,
      });

      expect(ticket).toBeDefined();
      expect(create).toHaveBeenCalled();
      expect(create).toHaveBeenCalledTimes(1);
      expect(create).toHaveBeenCalledWith(expectedTicket);
      expect(ticket).toMatchObject(expectedTicket);
    });

    it('When creating strike off ticket, throw error', async () => {
      ticketMock = successTicket as Ticket;
      jest.spyOn(User, 'count').mockImplementationOnce(() => {
        return Promise.resolve(1);
      });
      jest.spyOn(User, 'findOne').mockImplementationOnce(() => {
        return Promise.resolve(null);
      });

      const ticket = strikeOff.create({
        type: TicketType.strikeOff,
        companyId: 1,
        status: TicketStatus.open,
        category: TicketCategory.management,
      });

      await expect(ticket).rejects.toThrow(AccountingTicketError);
      await expect(ticket).rejects.toMatchObject({
        message: 'No director found for the company',
      });
    });
  });
});
