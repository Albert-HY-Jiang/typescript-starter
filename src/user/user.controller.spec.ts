import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;
  
  const mockUserService = {
    create: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    remove: jest.fn(),
    mergeAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ 
        provide: UserService, 
        useValue: mockUserService}],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const name = 'Test User';
      const mockResult = { id: 1, name };
      mockUserService.create.mockResolvedValue(mockResult);

      const result = await controller.createUser(name);
      expect(result).toEqual(mockResult);
      expect(mockUserService.create).toHaveBeenCalledWith(name);
    });
  });

  describe('getUserById', () => {
    it('should return user by ID', async () => {
      const mockUser = { id: 1, name: 'Alice' };
      mockUserService.findById.mockResolvedValue(mockUser);

      const result = await controller.getUserById('1');
      expect(result).toEqual(mockUser);
      expect(mockUserService.findById).toHaveBeenCalledWith(1);
    });
  });  

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }];
      mockUserService.findAll.mockResolvedValue(mockUsers);

      const result = await controller.getAllUsers();
      expect(result).toEqual(mockUsers);
    });
  });

  describe('deleteUser', () => {
    it('should delete user by ID', async () => {
      const mockMessage = { message: 'User deleted' };
      mockUserService.remove.mockResolvedValue(mockMessage);

      const result = await controller.deleteUser('1');
      expect(result).toEqual(mockMessage);
      expect(mockUserService.remove).toHaveBeenCalledWith(1);
    });
  });
  
});
