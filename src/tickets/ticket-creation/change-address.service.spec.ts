import { Test, TestingModule } from '@nestjs/testing';
import { ChangeAddressService } from './change-address.service';
import {
  Ticket,
  TicketCategory,
  TicketStatus,
  TicketType,
} from '../ticket.model';
import { AccountingTicketError } from '../../common/error';
import { User, UserRole } from '../../users/user.model';

const successTicket = {
  type: TicketType.registrationAddressChange,
  category: TicketCategory.corporate,
  status: TicketStatus.open,
  companyId: 1,
  assigneeId: 1,
};

const expectedTicket = {
  type: TicketType.registrationAddressChange,
  category: TicketCategory.corporate,
  status: TicketStatus.open,
  companyId: 1,
  assigneeId: 1,
};

describe('ChangeAddressService', () => {
  let changeAddressService: ChangeAddressService;
  let ticketMock: Ticket;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChangeAddressService],
    }).compile();

    changeAddressService =
      module.get<ChangeAddressService>(ChangeAddressService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Should be defined', () => {
    expect(changeAddressService).toBeDefined();
  });

  describe('Validate function', () => {
    it('When ticket type is invalid, throw exception', async () => {
      const ticketPromise = changeAddressService.create({
        type: TicketType.managementReport,
        companyId: 1,
        status: TicketStatus.open,
        category: TicketCategory.corporate,
      });

      await expect(ticketPromise).rejects.toThrow(AccountingTicketError);
      await expect(ticketPromise).rejects.toMatchObject({
        message: 'Invalid ticket type',
      });
    });

    it('When category is invalid, throw exception', async () => {
      const ticketPromise = changeAddressService.create({
        type: TicketType.registrationAddressChange,
        companyId: 1,
        status: TicketStatus.open,
        category: TicketCategory.accounting,
      });

      await expect(ticketPromise).rejects.toThrow(AccountingTicketError);
      await expect(ticketPromise).rejects.toMatchObject({
        message: 'Invalid ticket category',
      });
    });

    it('When there is multiple secretary, throw exception', async () => {
      jest.spyOn(User, 'count').mockImplementation(() => {
        return Promise.resolve(2);
      });

      const ticketPromise = changeAddressService.create({
        type: TicketType.registrationAddressChange,
        companyId: 1,
        status: TicketStatus.open,
        category: TicketCategory.corporate,
      });

      await expect(ticketPromise).rejects.toThrow(AccountingTicketError);
      await expect(ticketPromise).rejects.toMatchObject({
        message:
          'Multiple users with role corporateSecretary. Cannot create a ticket',
      });
    });

    it('When there is multiple directors, throw exception', async () => {
      jest.spyOn(User, 'count').mockImplementationOnce(() => {
        return Promise.resolve(1);
      });
      jest.spyOn(User, 'count').mockImplementationOnce(() => {
        return Promise.resolve(2);
      });

      const ticketPromise = changeAddressService.create({
        type: TicketType.registrationAddressChange,
        companyId: 1,
        status: TicketStatus.open,
        category: TicketCategory.corporate,
      });

      await expect(ticketPromise).rejects.toThrow(AccountingTicketError);
      await expect(ticketPromise).rejects.toMatchObject({
        message: 'multiple directors found for the company',
      });
    });

    it('When the change address ticker existed, throw exception', async () => {
      jest.spyOn(User, 'count').mockImplementation(() => {
        return Promise.resolve(1);
      });
      jest.spyOn(Ticket, 'count').mockImplementationOnce(() => {
        return Promise.resolve(1);
      });

      const ticketPromise = changeAddressService.create({
        type: TicketType.registrationAddressChange,
        companyId: 1,
        status: TicketStatus.open,
        category: TicketCategory.corporate,
      });

      await expect(ticketPromise).rejects.toThrow(AccountingTicketError);
      await expect(ticketPromise).rejects.toMatchObject({
        message: 'a record already exists',
      });
    });

    describe('Create ticket function', () => {
      it('Create ticket with secretary successfully', async () => {
        ticketMock = successTicket as Ticket;
        jest.spyOn(User, 'count').mockImplementation(() => {
          return Promise.resolve(1);
        });
        jest.spyOn(Ticket, 'count').mockImplementation(() => {
          return Promise.resolve(0);
        });
        jest.spyOn(User, 'findOne').mockImplementation(() => {
          return Promise.resolve({
            id: 1,
            name: 'Test User',
            role: UserRole.corporateSecretary,
            companyId: 1,
          } as User);
        });
        const create = jest.spyOn(Ticket, 'create').mockImplementation(() => {
          return Promise.resolve(ticketMock);
        });

        const ticket = await changeAddressService.create({
          type: TicketType.registrationAddressChange,
          companyId: 1,
          status: TicketStatus.open,
          category: TicketCategory.corporate,
        });

        expect(ticket).toBeDefined();
        expect(create).toHaveBeenCalled();
        expect(create).toHaveBeenCalledTimes(1);
        expect(create).toHaveBeenCalledWith(expectedTicket);
        expect(ticket).toMatchObject(expectedTicket);
      });

      it('Create ticket with director successfully', async () => {
        ticketMock = successTicket as Ticket;
        jest.spyOn(User, 'count').mockImplementation(() => {
          return Promise.resolve(1);
        });
        jest.spyOn(Ticket, 'count').mockImplementation(() => {
          return Promise.resolve(0);
        });
        jest.spyOn(User, 'findOne').mockImplementationOnce(() => {
          return Promise.resolve(null);
        });
        jest.spyOn(User, 'findOne').mockImplementationOnce(() => {
          return Promise.resolve({
            id: 1,
            name: 'Test User',
            role: UserRole.director,
            companyId: 1,
          } as User);
        });
        const create = jest.spyOn(Ticket, 'create').mockImplementation(() => {
          return Promise.resolve(ticketMock);
        });

        const ticket = await changeAddressService.create({
          type: TicketType.registrationAddressChange,
          companyId: 1,
          status: TicketStatus.open,
          category: TicketCategory.corporate,
        });

        expect(ticket).toBeDefined();
        expect(create).toHaveBeenCalled();
        expect(create).toHaveBeenCalledTimes(1);
        expect(create).toHaveBeenCalledWith(expectedTicket);
        expect(ticket).toMatchObject(expectedTicket);
      });

      it('If there is no secretary and director, throw error', async () => {
        ticketMock = successTicket as Ticket;
        jest.spyOn(User, 'count').mockImplementation(() => {
          return Promise.resolve(1);
        });
        jest.spyOn(Ticket, 'count').mockImplementation(() => {
          return Promise.resolve(0);
        });
        jest.spyOn(User, 'findOne').mockImplementationOnce(() => {
          return Promise.resolve(null);
        });
        jest.spyOn(User, 'findOne').mockImplementationOnce(() => {
          return Promise.resolve(null);
        });

        const ticket = changeAddressService.create({
          type: TicketType.registrationAddressChange,
          companyId: 1,
          status: TicketStatus.open,
          category: TicketCategory.corporate,
        });
        await expect(ticket).rejects.toThrow(AccountingTicketError);
        await expect(ticket).rejects.toMatchObject({
          message: 'Cannot find assignee for the ticket',
        });
      });
    });
  });
});
