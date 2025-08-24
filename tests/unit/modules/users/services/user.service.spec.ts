import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "@api/modules/users/services/user.service";
import { PrismaService } from "@api/database/prisma.service";
import { ConflictException } from "@nestjs/common";
import { mockDeep, DeepMockProxy } from "jest-mock-extended";
import { Status } from "@api/enums/status.enum";
import { UserValidationService } from "@api/modules/users/services/user.validation.service";
import { EmailService } from "@api/modules/mailer/email.service";

jest.mock("bcryptjs", () => ({
  compare: () => Promise.resolve(true),
  hash: () => Promise.resolve("newhashedpassword"),
}));

describe("UserService", () => {
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

  it("should create a new user successfully", async () => {
    userValidationService.isRoleChecked.mockResolvedValue(true);
    userValidationService.isEmailInUse.mockResolvedValue(false);
    userValidationService.isPhoneInUse.mockResolvedValue(false);

    prisma.user.create.mockResolvedValueOnce({
      id: 1,
      userId: "uuid-1",
      firstName: "John",
      lastName: "Doe",
      email: "john@doe.com",
      phoneNumber: "1234567890",
      password: "hashedPassword",
      refreshToken: "refreshTokenValue",
      profilePic: "https://example.com/profile-pic.jpg",
      status: Status.ACTIVE,
      createdBy: 1,
      updatedBy: 1,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    jest.spyOn(userService, "createUserRole").mockResolvedValue(undefined);

    const data = {
      email: "john@doe.com",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
      phoneNumber: "1234567890",
      roleId: 1,
    };

    const result = await userService.createUser(data);

    expect(result).toEqual(
      expect.objectContaining({
        firstName: "John",
        lastName: "Doe",
        email: "john@doe.com",
        full_name: "John Doe",
      })
    );

    expect(userValidationService.isRoleChecked).toHaveBeenCalledWith(1);
    expect(userValidationService.isEmailInUse).toHaveBeenCalledWith(
      "john@doe.com"
    );
    expect(userValidationService.isPhoneInUse).toHaveBeenCalledWith(
      "1234567890"
    );
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: "john@doe.com",
        password: expect.any(String), // Password is hashed
      }),
    });
    expect(userService.createUserRole).toHaveBeenCalledWith(1, 1);
  });

  it("should throw ConflictException if role is not found", async () => {
    userValidationService.isRoleChecked.mockResolvedValue(false);

    const data = {
      email: "john@doe.com",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
      phoneNumber: "1234567890",
      roleId: 1,
    };

    await expect(userService.createUser(data)).rejects.toThrow(
      ConflictException
    );

    expect(userValidationService.isRoleChecked).toHaveBeenCalledWith(1);
  });

  it("should throw ConflictException if email is already in use", async () => {
    userValidationService.isRoleChecked.mockResolvedValue(true);
    userValidationService.isEmailInUse.mockResolvedValue(true);

    const data = {
      email: "john@doe.com",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
      phoneNumber: "1234567890",
      roleId: 1,
    };

    await expect(userService.createUser(data)).rejects.toThrow(
      ConflictException
    );

    expect(userValidationService.isEmailInUse).toHaveBeenCalledWith(
      "john@doe.com"
    );
  });

  it("should throw ConflictException if phone number is already in use", async () => {
    userValidationService.isRoleChecked.mockResolvedValue(true);
    userValidationService.isEmailInUse.mockResolvedValue(false);
    userValidationService.isPhoneInUse.mockResolvedValue(true);

    const data = {
      email: "john@doe.com",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
      phoneNumber: "1234567890",
      roleId: 1,
    };

    await expect(userService.createUser(data)).rejects.toThrow(
      ConflictException
    );

    expect(userValidationService.isPhoneInUse).toHaveBeenCalledWith(
      "1234567890"
    );
  });

  describe("getAllUsers", () => {
    it("should return paginated users list", async () => {
      const mockUsers = [
        {
          id: 1,
          userId: "uuid-1",
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          phoneNumber: "1234567890",
          password: "hashedPassword",
          status: Status.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date(),
          refreshToken: "refreshTokenValue",
          profilePic: "https://example.com/profile-pic.jpg",
          createdBy: 1,
          updatedBy: 1,
          deletedAt: null,
        },
      ];
      prisma.user.findMany.mockResolvedValue(mockUsers);
      prisma.user.count.mockResolvedValue(1);
      const result = await userService.getAllUsers(1, 10, "id", "asc");
      expect(result.data).toBeDefined();
      expect(result.totalCount).toBe(1);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { id: "asc" },
      });
    });
  });
  describe("updateUser", () => {
    it("should update user successfully", async () => {
      const updateData = {
        firstName: "John Updated",
        lastName: "Doe Updated",
        email: "john@example.com",
        phoneNumber: "1234567890",
        password: "hashedPassword",
        refreshToken: "refreshTokenValue",
        profilePic: "https://example.com/profile-pic.jpg",
        status: Status.ACTIVE,
        createdBy: 1,
        updatedBy: 1,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockUpdatedUser = {
        id: 1,
        userId: "uuid-1",
        ...updateData,
        email: "john@example.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prisma.user.update.mockResolvedValue(mockUpdatedUser);
      const result = await userService.updateUser({
        where: { id: 1 },
        data: updateData,
      });
      expect(result).toBeDefined();
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
      });
    });
  });
  describe("updateUserStatus", () => {
    it("should update user status successfully", async () => {
      const mockUpdatedUser = {
        id: 1,
        userId: "uuid-1",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phoneNumber: "1234567890",
        password: "hashedPassword",
        refreshToken: "refreshTokenValue",
        profilePic: "https://example.com/profile-pic.jpg",
        status: Status.ACTIVE,
        createdBy: 1,
        updatedBy: 1,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prisma.user.update.mockResolvedValue(mockUpdatedUser);
      const result = await userService.updateUserStatus(1, Status.ACTIVE);
      expect(result).toBeDefined();
      expect(result.status).toBe(Status.ACTIVE);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: Status.ACTIVE },
      });
    });
  });
  describe("deleteUser", () => {
    it("should delete user successfully", async () => {
      const mockUser = {
        id: 1,
        userId: "uuid-1",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phoneNumber: "1234567890",
        password: "hashedPassword",
        refreshToken: "refreshTokenValue",
        profilePic: "https://example.com/profile-pic.jpg",
        status: Status.ACTIVE,
        createdBy: 1,
        updatedBy: 1,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.delete.mockResolvedValue(mockUser);
      const result = await userService.deleteUser({ id: 1 });
      expect(result).toBeDefined();
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
    it("should throw error if user not found", async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(userService.deleteUser({ id: 999 })).rejects.toThrow();
    });
  });
  describe("changePassword", () => {
    it("should change password successfully", async () => {
      const mockUser = {
        id: 1,
        userId: "uuid-1",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phoneNumber: "1234567890",
        password: "$2a$10$somehashedpassword",
        refreshToken: "token123",
        profilePic: "profile.jpg",
        status: Status.ACTIVE,
        createdBy: 1,
        updatedBy: 1,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue({
        ...mockUser,
        password: "newhashedpassword",
      });
      const result = await userService.changePassword(
        1,
        "currentPassword",
        "newPassword"
      );
      expect(result.message).toBeDefined();
      expect(prisma.user.update).toHaveBeenCalled();
    });
  });
});
