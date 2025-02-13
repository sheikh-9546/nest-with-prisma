import { Test, TestingModule } from "@nestjs/testing";
import { UserController } from "./user.controller";
import { UserService } from "@api/modules/users/services/user.service";
import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { AuditService } from "@api/modules/audit/audit.service";
import { PrismaService } from "@api/database/prisma.service";
import { Reflector } from "@nestjs/core";
import { AuditAction } from "@api/enums/audit-action.enum";
import { Status } from "@api/enums/status.enum";
import { AuditChangesInterceptor } from "@api/modules/audit/interceptors/audit-changes.interceptor";
import { ExecutionContext } from "@nestjs/common";
import { of, lastValueFrom } from 'rxjs';
import { FileUploadService } from '../common/services/file-upload.service';

describe("UserController", () => {
  let userController: UserController;
  let userServiceMock: DeepMockProxy<UserService>;
  let auditServiceMock: DeepMockProxy<AuditService>;
  let prismaServiceMock: DeepMockProxy<PrismaService>;
  let fileUploadServiceMock: DeepMockProxy<FileUploadService>;
  let auditInterceptor: AuditChangesInterceptor;

  const mockContext = (method: string) => ({
    switchToHttp: () => ({
      getRequest: () => ({
        method,
        user: { id: '1' },
        ip: '127.0.0.1',
        path: '/users',
        get: () => 'test-user-agent',
        params: { id: '1' }
      }),
      getResponse: () => ({}),
      getNext: () => jest.fn(),
    }),
    getHandler: () => jest.fn(),
    getType: () => 'http',
    getClass: () => UserController,
    getArgs: () => [],
    getArgByIndex: () => null,
    switchToRpc: () => null,
    switchToWs: () => null,
  });

  const setupTest = async (metadata = { action: AuditAction.CREATE, model: 'User' }) => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: AuditService, useValue: auditServiceMock },
        { provide: PrismaService, useValue: prismaServiceMock },
        { provide: FileUploadService, useValue: fileUploadServiceMock },
        Reflector,
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    const reflector = module.get(Reflector);
    auditInterceptor = new AuditChangesInterceptor(
      reflector,
      auditServiceMock,
      prismaServiceMock
    );
  };

  beforeEach(async () => {
    userServiceMock = mockDeep<UserService>();
    auditServiceMock = mockDeep<AuditService>();
    prismaServiceMock = mockDeep<PrismaService>();
    fileUploadServiceMock = mockDeep<FileUploadService>();
    await setupTest();
  });

  describe("audit logging", () => {
    const mockUser = {
      id: "1",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      phoneNumber: "1234567890",
      password: "hashedPassword",
      refreshToken: null,
      profilePic: null,
      status: Status.ACTIVE,
      createdBy: 1,
      updatedBy: 1,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should log user creation", async () => {
      const createUserDto = {
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        phoneNumber: "1234567890",
        password: "password123",
        roleId: 1
      };

      const createdUser = { id: "1", ...createUserDto };
      userServiceMock.createUser.mockResolvedValue(createdUser);

      // Apply interceptor manually
      const context = mockContext('POST');
      jest.spyOn(Reflector.prototype, 'get').mockReturnValue({
        action: AuditAction.CREATE,
        model: 'User'
      });

      const next = {
        handle: () => of(createdUser)
      };

      // Wait for interceptor to complete
      const interceptor$ = await auditInterceptor.intercept(context as ExecutionContext, next);
      await lastValueFrom(interceptor$);
      
      await userController.createUser(createUserDto);

      expect(auditServiceMock.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.CREATE,
          model: 'User',
          modelId: createdUser.id,
        })
      );
    });

    it("should log user update with changes", async () => {
      const updateData = {
        firstName: "Updated",
        lastName: "User",
        phoneNumber: "1234567890",
        status: Status.ACTIVE
      };

      prismaServiceMock.user.findUnique.mockResolvedValue(mockUser);
      userServiceMock.updateUser.mockResolvedValue({ ...mockUser, ...updateData });

      const context = mockContext('PATCH');
      jest.spyOn(Reflector.prototype, 'get').mockReturnValue({
        action: AuditAction.UPDATE,
        model: 'User'
      });

      const next = {
        handle: () => of({ ...mockUser, ...updateData })
      };

      const interceptor$ = await auditInterceptor.intercept(context as ExecutionContext, next);
      await lastValueFrom(interceptor$);
      
      await userController.updateUser(mockUser.id, updateData);

      expect(auditServiceMock.log).toHaveBeenCalled();
    });

    it("should log user deletion", async () => {
      const deletedUser = { ...mockUser, deletedAt: new Date() };
      prismaServiceMock.user.findUnique.mockResolvedValue(mockUser);
      userServiceMock.deleteUser.mockResolvedValue(deletedUser);

      const context = mockContext('DELETE');
      jest.spyOn(Reflector.prototype, 'get').mockReturnValue({
        action: AuditAction.DELETE,
        model: 'User'
      });

      const next = {
        handle: () => of(deletedUser)
      };

      const interceptor$ = await auditInterceptor.intercept(context as ExecutionContext, next);
      await lastValueFrom(interceptor$);
      
      await userController.deleteUser(mockUser.id);

      expect(auditServiceMock.log).toHaveBeenCalled();
    });
  });
});
