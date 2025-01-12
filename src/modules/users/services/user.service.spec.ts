import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '@api/database/prisma.service';
import { ConflictException } from '@nestjs/common';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { Status } from '@api/enums/status.enum';
import { UserValidationService } from './user.validation.service';
import { EmailService } from '@api/modules/mailer/email.service';

describe('UserService', () => {
  let userService: UserService;
  let prisma: DeepMockProxy<PrismaService>;
  let userValidationService: DeepMockProxy<UserValidationService>;
  let emailService: DeepMockProxy<EmailService>;

  beforeEach(async () => {
    prisma = mockDeep<PrismaService>();
    userValidationService = mockDeep<UserValidationService>();
    emailService = mockDeep<EmailService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: UserValidationService,
          useValue: userValidationService,
        },
        {
          provide: EmailService,
          useValue: emailService, 
        },
      ],
    }).compile();
    userService = module.get<UserService>(UserService);
    prisma = module.get(PrismaService);
    userValidationService = module.get(UserValidationService); 
    emailService = module.get(EmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new user successfully', async () => {
    userValidationService.isRoleChecked.mockResolvedValue(true);
    userValidationService.isEmailInUse.mockResolvedValue(false);
    userValidationService.isPhoneInUse.mockResolvedValue(false);

    prisma.user.create.mockResolvedValueOnce({
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@doe.com',
      phoneNumber: '1234567890',
      password: 'hashedPassword',
      refreshToken: 'refreshTokenValue',
      profilePic: 'https://example.com/profile-pic.jpg',
      status: Status.ACTIVE, // or Status.ACTIVE
      createdBy: 1,
      updatedBy: 1,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    jest.spyOn(userService, 'createUserRole').mockResolvedValue(undefined);

    const data = {
      email: 'john@doe.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
      roleId: 1,
    };

    const result = await userService.createUser(data);

    expect(result).toEqual(
      expect.objectContaining({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@doe.com',
        full_name: 'John Doe',
      }),
    );

    expect(userValidationService.isRoleChecked).toHaveBeenCalledWith(1);
    expect(userValidationService.isEmailInUse).toHaveBeenCalledWith('john@doe.com');
    expect(userValidationService.isPhoneInUse).toHaveBeenCalledWith('1234567890');
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: 'john@doe.com',
        password: expect.any(String), // Password is hashed
      }),
    });
    expect(userService.createUserRole).toHaveBeenCalledWith('1', 1);
  });

  it('should throw ConflictException if role is not found', async () => {
    userValidationService.isRoleChecked.mockResolvedValue(false);

    const data = {
      email: 'john@doe.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
      roleId: 1,
    };

    await expect(userService.createUser(data)).rejects.toThrow(
      ConflictException,
    );

    expect(userValidationService.isRoleChecked).toHaveBeenCalledWith(1);
  });

  it('should throw ConflictException if email is already in use', async () => {
    userValidationService.isRoleChecked.mockResolvedValue(true);
    userValidationService.isEmailInUse.mockResolvedValue(true);

    const data = {
      email: 'john@doe.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
      roleId: 1,
    };

    await expect(userService.createUser(data)).rejects.toThrow(
      ConflictException,
    );

    expect(userValidationService.isEmailInUse).toHaveBeenCalledWith('john@doe.com');
  });

  it('should throw ConflictException if phone number is already in use', async () => {
    userValidationService.isRoleChecked.mockResolvedValue(true);
    userValidationService.isEmailInUse.mockResolvedValue(false);
    userValidationService.isPhoneInUse.mockResolvedValue(true);

    const data = {
      email: 'john@doe.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
      roleId: 1,
    };

    await expect(userService.createUser(data)).rejects.toThrow(
      ConflictException,
    );

    expect(userValidationService.isPhoneInUse).toHaveBeenCalledWith('1234567890');
  });

});
