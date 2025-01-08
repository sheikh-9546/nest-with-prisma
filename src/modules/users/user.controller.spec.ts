import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '@api/modules/users/services/user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

describe('UserController', () => {
  let userController: UserController;
  let userServiceMock: DeepMockProxy<UserService>;

  beforeEach(async () => {
    userServiceMock = mockDeep<UserService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: userServiceMock, // Use the deeply mocked service
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should call createUser method of UserService and return result', async () => {
      const mockUser = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        full_name: 'John Doe',
      };

      const createUserDto: CreateUserDto = {
        email: 'john.doe@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
        roleId: 1,
      };

      // Mock the service method
      userServiceMock.createUser.mockResolvedValue(mockUser);

      // Call the controller method
      const result = await userController.createUser(createUserDto);

      // Assertions
      expect(result).toEqual(mockUser);
      expect(userServiceMock.createUser).toHaveBeenCalledTimes(1);
      expect(userServiceMock.createUser).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('getAllUsers', () => {
    // it('should call getAllUsers method of UserService and return result', async () => {
    //   const mockUsers = [
    //     { id: 1, firstName: 'John', lastName: 'Doe' },
    //     { id: 2, firstName: 'Jane', lastName: 'Doe' },
    //   ];

    //   // Mock the service method
    //   userServiceMock.getAllUsers.mockResolvedValue(mockUsers);

    //   // Call the controller method
    //   const result = await userController.getAllUsers({
    //     page: 1,
    //     limit: 10,
    //     sort_column: 'id',
    //     sort_direction: 'asc',
    //   });

    //   // Assertions
    //   expect(result).toEqual(mockUsers);
    //   expect(userServiceMock.getAllUsers).toHaveBeenCalledTimes(1);
    //   expect(userServiceMock.getAllUsers).toHaveBeenCalledWith({
    //     page: 1,
    //     limit: 10,
    //     sort_column: 'id',
    //     sort_direction: 'asc',
    //   });
    // });
  });
});
