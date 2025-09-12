import { Test, TestingModule } from '@nestjs/testing';
import { DbModule } from '../../db.module';
import { UserApiController } from './user-api.controller';
import { UserModule } from '../user.module';

describe('UsersController', () => {
  let controller: UserApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserApiController],
      imports: [DbModule, UserModule],
    }).compile();

    controller = module.get<UserApiController>(UserApiController);
  });

  it('should be defined', async () => {
    expect(controller).toBeDefined();

    const res = await controller.findAll();
    console.log(res);
  });

  describe('create', () => {
    describe('managementReport', () => {
      it('creates managementReport ticket', async () => {});
    });

    describe('registrationAddressChange', () => {
      it('creates registrationAddressChange ticket', async () => {});
    });
  });
});
