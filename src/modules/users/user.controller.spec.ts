import { Test, TestingModule } from "@nestjs/testing";
import { UserController } from "./user.controller";
import { UserService } from "@api/modules/users/services/user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { Status } from "@api/enums/status.enum";
import { UpdateUserDto } from "./dto/update-user.dto";

describe("UserController", () => {
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
  describe("createUser", () => {
    it("should call createUser method of UserService and return result", async () => {
      const mockUser = {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        full_name: "John Doe",
      };
      const createUserDto: CreateUserDto = {
        email: "john.doe@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
        phoneNumber: "1234567890",
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
    it("should throw an error if UserService.createUser fails", async () => {
      const createUserDto: CreateUserDto = {
        email: "john.doe@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
        phoneNumber: "1234567890",
        roleId: 1,
      };
      userServiceMock.createUser.mockRejectedValue(
        new Error("User creation failed")
      );
      await expect(userController.createUser(createUserDto)).rejects.toThrow(
        "User creation failed"
      );
      expect(userServiceMock.createUser).toHaveBeenCalledWith(createUserDto);
    });
  });

  it("should retrieve user details successfully", async () => {
    // Mock the UserService.getUserDetails method
    userServiceMock.getUserDetails.mockResolvedValueOnce({
      id: "1",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      full_name: "John Doe",
    });

    const id = "1";

    // Call the controller method
    const result = await userController.getUser(id);

    // Assertions
    expect(result).toEqual({
      id: "1",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      full_name: "John Doe",
    });

    // Ensure the service method was called with the correct id
    expect(userServiceMock.getUserDetails).toHaveBeenCalledWith({ id: "1" });
    expect(userServiceMock.getUserDetails).toHaveBeenCalledTimes(1);
  });

  it("should throw an exception if user not found", async () => {
    // Mock the userServiceMock.getUserDetails method to throw an exception
    userServiceMock.getUserDetails.mockRejectedValueOnce(
      new Error("User not found")
    );

    const id = "999";

    // Expect the controller method to throw an error
    await expect(userController.getUser(id)).rejects.toThrow("User not found");

    // Ensure the service method was called with the correct id
    expect(userServiceMock.getUserDetails).toHaveBeenCalledWith({ id: "999" });
    expect(userServiceMock.getUserDetails).toHaveBeenCalledTimes(1);
  });

  describe("getAllUsers", () => {
    it("should call getAllUsers method of UserService and return paginated result", async () => {
      const mockUsers = [
        {
          id: 1,
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
        },
        {
          id: 2,
          firstName: "Jane",
          lastName: "Doe",
          email: "jane.doe@example.com",
        },
      ];
      const expectedResponse = {
        data: mockUsers,
        totalCount: 2,
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
      };
      userServiceMock.getAllUsers.mockResolvedValue(expectedResponse);
      const paginationDto = {
        page: 1,
        limit: 10,
        sort_column: "id",
        sort_direction: "asc",
      };
      const result = await userController.getAllUsers(paginationDto);
      expect(result).toEqual(expectedResponse);
      expect(userServiceMock.getAllUsers).toHaveBeenCalledWith(
        1,
        10,
        "id",
        "asc"
      );
      expect(userServiceMock.getAllUsers).toHaveBeenCalledTimes(1);
    });
    it("should return empty data array when no users found", async () => {
      const expectedResponse = {
        data: [],
        totalCount: 0,
        currentPage: 1,
        totalPages: 0,
        pageSize: 10,
      };
      userServiceMock.getAllUsers.mockResolvedValue(expectedResponse);
      const result = await userController.getAllUsers({
        page: 1,
        limit: 10,
        sort_column: "id",
        sort_direction: "asc",
      });
      expect(result).toEqual(expectedResponse);
      expect(userServiceMock.getAllUsers).toHaveBeenCalledTimes(1);
    });
    it("should throw an error if UserService.getAllUsers fails", async () => {
      userServiceMock.getAllUsers.mockRejectedValue(
        new Error("Failed to fetch users")
      );
      await expect(
        userController.getAllUsers({
          page: 1,
          limit: 10,
          sort_column: "id",
          sort_direction: "asc",
        })
      ).rejects.toThrow("Failed to fetch users");
      expect(userServiceMock.getAllUsers).toHaveBeenCalledTimes(1);
    });
  });
  describe("getUser", () => {
    it("should return user details", async () => {
      const mockUser = {
        id: "1",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        role: "admin",
      };
      userServiceMock.getUserDetails.mockResolvedValue(mockUser);
      const result = await userController.getUser("1");
      expect(result).toEqual(mockUser);
      expect(userServiceMock.getUserDetails).toHaveBeenCalledWith({ id: "1" });
    });
    it("should throw error when user not found", async () => {
      userServiceMock.getUserDetails.mockRejectedValue(
        new Error("User not found")
      );
      await expect(userController.getUser("999")).rejects.toThrow(
        "User not found"
      );
    });
  });
  describe("updateUser", () => {
    it("should update user details", async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: "John Updated",
        lastName: "Doe Updated",
        phoneNumber: "1234567890",
        status: Status.ACTIVE,
        updatedAt: new Date(),
      };
      const mockUpdatedUser = {
        id: "1",
        ...updateUserDto,
        email: "john@example.com",
      };
      userServiceMock.updateUser.mockResolvedValue(mockUpdatedUser);
      const result = await userController.updateUser("1", updateUserDto);
      expect(result).toEqual(mockUpdatedUser);
      expect(userServiceMock.updateUser).toHaveBeenCalledWith({
        where: { id: "1" },
        data: updateUserDto,
      });
    });
  });
  describe("deleteUser", () => {
    it("should delete user", async () => {
      const mockDeletedUser = {
        id: "1",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phoneNumber: "1234567890",
        password: "password123",
        refreshToken: "token123",
        profilePic: "profile.jpg",
        status: Status.ACTIVE,
        createdBy: 1,
        updatedBy: 1,
        deletedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      userServiceMock.deleteUser.mockResolvedValue(mockDeletedUser);
      const result = await userController.deleteUser("1");
      expect(result).toEqual(mockDeletedUser);
      expect(userServiceMock.deleteUser).toHaveBeenCalledWith({ id: "1" });
    });
  });
  
});
