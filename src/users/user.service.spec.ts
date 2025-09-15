import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { User, UserRole } from './user.model';

describe('UserService', () => {
  let userService: UserService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserService],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('Create', () => {
    it('Accountant user', async () => {
      const createSpy = jest.spyOn(User, 'create').mockResolvedValue([]);
      await userService.create({
        name: 'Test User',
        role: UserRole.accountant,
        companyId: 1,
      });
      expect(createSpy).toHaveBeenCalled();
      expect(createSpy).toHaveBeenCalledTimes(1);
      expect(createSpy).toHaveBeenCalledWith({
        name: 'Test User',
        role: UserRole.accountant,
        companyId: 1,
      });
    });

    it('Corporate user', async () => {
      const createSpy = jest.spyOn(User, 'create').mockResolvedValue([]);
      await userService.create({
        name: 'Test User',
        role: UserRole.corporateSecretary,
        companyId: 1,
      });
      expect(createSpy).toHaveBeenCalled();
      expect(createSpy).toHaveBeenCalledTimes(1);
      expect(createSpy).toHaveBeenCalledWith({
        name: 'Test User',
        role: UserRole.corporateSecretary,
        companyId: 1,
      });
    });

    it('Director user', async () => {
      const createSpy = jest.spyOn(User, 'create').mockResolvedValue([]);
      await userService.create({
        name: 'Test User',
        role: UserRole.director,
        companyId: 1,
      });

      expect(createSpy).toHaveBeenCalled();
      expect(createSpy).toHaveBeenCalledTimes(1);
      expect(createSpy).toHaveBeenCalledWith({
        name: 'Test User',
        role: UserRole.director,
        companyId: 1,
      });
    });
  });

  describe('Get list', () => {
    it('Users', async () => {
      const findAll = jest.spyOn(User, 'findAll').mockResolvedValue([]);
      const userCount = jest
        .spyOn(User, 'count')
        .mockImplementation(() => Promise.resolve(0));

      await userService.list({
        current: 1,
        pageSize: 20,
      });

      expect(findAll).toHaveBeenCalled();
      expect(findAll).toHaveBeenCalledTimes(1);
      expect(findAll).toHaveBeenCalledWith({
        where: {},
        limit: 20,
        offset: 0,
      });
      expect(userCount).toHaveBeenCalled();
      expect(userCount).toHaveBeenCalledTimes(1);
      expect(userCount).toHaveBeenCalledWith({ where: {} });
    });
  });
});
