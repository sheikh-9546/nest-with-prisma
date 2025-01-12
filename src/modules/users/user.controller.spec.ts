import { Test, TestingModule } from "@nestjs/testing";
import { UserController } from "./user.controller";
import { UserService } from "@api/modules/users/services/user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { DeepMockProxy, mockDeep } from "jest-mock-extended";

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
});
