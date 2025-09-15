import { Test, TestingModule } from '@nestjs/testing';
import { UserApiController } from './user-api.controller';
import { UserService } from '../user.service';
import { UserRole } from '../user.model';
import { ConflictException, HttpException } from '@nestjs/common';
import { ConnectionTimedOutError } from 'sequelize';
import { AccountingUserError } from '../../common/error';

describe('UserController', () => {
  let controller: UserApiController;
  let userService: UserService;
  beforeEach(async () => {
    userService = {
      list: jest.fn(),
      create: jest.fn(),
    } as unknown as UserService;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserApiController],
      providers: [{ provide: UserService, useValue: userService }],
    }).compile();

    controller = module.get<UserApiController>(UserApiController);
  });

  it('Should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Create', () => {
    it('Accountant user', async () => {
      const createUserSpy = jest.spyOn(userService, 'create');
      await controller.create({
        name: 'Test User',
        role: UserRole.accountant,
        companyId: 1,
      });
      expect(createUserSpy).toHaveBeenCalled();
      expect(createUserSpy).toHaveBeenCalledTimes(1);
      expect(createUserSpy).toHaveBeenCalledWith({
        name: 'Test User',
        role: UserRole.accountant,
        companyId: 1,
      });
    });

    it('Corporate user', async () => {
      const createUserSpy = jest.spyOn(userService, 'create');
      await controller.create({
        name: 'Test User',
        role: UserRole.corporateSecretary,
        companyId: 1,
      });
      expect(createUserSpy).toHaveBeenCalled();
      expect(createUserSpy).toHaveBeenCalledTimes(1);
      expect(createUserSpy).toHaveBeenCalledWith({
        name: 'Test User',
        role: UserRole.corporateSecretary,
        companyId: 1,
      });
    });

    it('Director user', async () => {
      const createUserSpy = jest.spyOn(userService, 'create');
      await controller.create({
        name: 'Test User',
        role: UserRole.director,
        companyId: 1,
      });

      expect(createUserSpy).toHaveBeenCalled();
      expect(createUserSpy).toHaveBeenCalledTimes(1);
      expect(createUserSpy).toHaveBeenCalledWith({
        name: 'Test User',
        role: UserRole.director,
        companyId: 1,
      });
    });

    it('Create user, throw 500 error', async () => {
      jest
        .spyOn(userService, 'create')
        .mockRejectedValue(new AccountingUserError('Database error'));

      const create = controller.create({
        name: 'Test User',
        role: UserRole.director,
        companyId: 1,
      });
      await expect(create).rejects.toMatchObject({
        status: 500,
        message: 'Database error',
      });
      await expect(create).rejects.toThrow(HttpException);
    });

    it('Create user, throw 503 error', async () => {
      jest
        .spyOn(userService, 'create')
        .mockRejectedValue(new Error('Invalid company ID'));

      const create = controller.create({
        name: 'Test User',
        role: UserRole.director,
        companyId: 1,
      });
      await expect(create).rejects.toThrow(HttpException);
      await expect(create).rejects.toMatchObject({
        status: 503,
        message: 'Service unavailable',
      });
    });
  });

  describe('Get list', () => {
    it('user successfully', async () => {
      const findAll = jest.spyOn(userService, 'list').mockResolvedValue({
        data: [],
        total: 0,
        current: 1,
        pageSize: 20,
      });
      await controller.list('1', '20');
      expect(findAll).toHaveBeenCalled();
      expect(findAll).toHaveBeenCalledTimes(1);
      expect(findAll).toHaveBeenCalledWith({
        current: 1,
        pageSize: 20,
      });
    });

    it('user, throw 500 error', async () => {
      jest
        .spyOn(userService, 'list')
        .mockRejectedValue(new AccountingUserError('Invalid company ID'));

      const list = controller.list('1', '20');
      await expect(list).rejects.toMatchObject({
        status: 500,
        message: 'Invalid company ID',
      });
      await expect(list).rejects.toThrow(HttpException);
    });

    it('user, throw 503 error', async () => {
      jest
        .spyOn(userService, 'list')
        .mockRejectedValue(
          new ConnectionTimedOutError(new ConflictException()),
        );

      const list = controller.list('1', '20');
      await expect(list).rejects.toThrow(HttpException);
      await expect(list).rejects.toMatchObject({
        status: 503,
        message: 'Service unavailable',
      });
    });
  });
});
