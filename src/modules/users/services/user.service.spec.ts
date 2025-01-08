import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '@api/database/prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { Status } from '@prisma/client';
import { UserValidationService } from './user.validation.service';
import { EmailService } from '@api/modules/mailer/email.service';

describe('UserService', () => {
  let userService: UserService;
  let prismaServiceMock: DeepMockProxy<PrismaService>;
  let userValidationServiceMock: DeepMockProxy<UserValidationService>;
  let emailServiceMock: DeepMockProxy<EmailService>;

  beforeEach(async () => {
    prismaServiceMock = mockDeep<PrismaService>();
    userValidationServiceMock = mockDeep<UserValidationService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock, // Mocked PrismaService
        },
        {
          provide: UserValidationService,
          useValue: userValidationServiceMock, // Mocked UserValidationService
        },
        {
          provide: EmailService,
          useValue: emailServiceMock,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a user successfully when all validations pass', async () => {
      const mockUser = {
        id: '1',
        full_name: 'John Doe',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phoneNumber: '1234567890',
        password: 'hashedPassword',
        roleId: 1,
        refreshToken: null,
        profilePic: null,
        status: Status.INACTIVE,
        createdBy: 1,
        updatedBy: 1,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const createUserDto = {
        email: 'john.doe@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
        roleId: 1,
      };

      // Mock validations to succeed
      userValidationServiceMock.isEmailInUse.mockResolvedValue(false); // Email does not exist
      userValidationServiceMock.isPhoneInUse.mockResolvedValue(false); // Phone number does not exist
      userValidationServiceMock.isRoleChecked.mockResolvedValue(true); // Role is valid

      // Mock Prisma create call
      prismaServiceMock.user.create.mockResolvedValue(mockUser);

      const result = await userService.createUser(createUserDto);

      // Assertions
      expect(result).toEqual(mockUser);
      expect(userValidationServiceMock.isEmailInUse).toHaveBeenCalledWith(createUserDto.email);
      expect(userValidationServiceMock.isPhoneInUse).toHaveBeenCalledWith(createUserDto.phoneNumber);
      expect(userValidationServiceMock.isRoleChecked).toHaveBeenCalledWith(createUserDto.roleId);
      expect(prismaServiceMock.user.create).toHaveBeenCalledWith({
        data: createUserDto,
      });
    });

    it('should throw an error if the phone number already exists', async () => {
      const createUserDto = {
        email: 'john.doe@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
        roleId: 1,
      };

      // Mock phone number validation to fail
      userValidationServiceMock.isEmailInUse.mockResolvedValue(false); // Email does not exist
      userValidationServiceMock.isPhoneInUse.mockResolvedValue(true); // Phone number exists

      await expect(userService.createUser(createUserDto)).rejects.toThrow(
        'Phone number already exists',
      );

      expect(userValidationServiceMock.isEmailInUse).toHaveBeenCalledWith(createUserDto.email);
      expect(userValidationServiceMock.isPhoneInUse).toHaveBeenCalledWith(createUserDto.phoneNumber);
      expect(userValidationServiceMock.isRoleChecked).not.toHaveBeenCalled(); // Role validation should not be called
      expect(prismaServiceMock.user.create).not.toHaveBeenCalled(); // User creation should not be attempted
    });

    it('should throw an error if the email already exists', async () => {
      const createUserDto = {
        email: 'john.doe@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
        roleId: 1,
      };

      // Mock email validation to fail
      userValidationServiceMock.isEmailInUse.mockResolvedValue(true); // Email exists
      userValidationServiceMock.isPhoneInUse.mockResolvedValue(false); // Phone number does not exist

      await expect(userService.createUser(createUserDto)).rejects.toThrow(
        'Email already exists',
      );

      expect(userValidationServiceMock.isEmailInUse).toHaveBeenCalledWith(createUserDto.email);
      expect(userValidationServiceMock.isPhoneInUse).toHaveBeenCalledWith(createUserDto.phoneNumber);
      expect(userValidationServiceMock.isRoleChecked).not.toHaveBeenCalled(); // Role validation should not be called
      expect(prismaServiceMock.user.create).not.toHaveBeenCalled(); // User creation should not be attempted
    });
  });
});
