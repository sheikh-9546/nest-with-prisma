import { Test, TestingModule } from "@nestjs/testing";
import { SettingController } from "./setting.controller";
import { SettingService } from "./setting.service";
import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { AuditService } from "@api/modules/audit/audit.service";
import { PrismaService } from "@api/database/prisma.service";
import { Reflector } from "@nestjs/core";
import { AuditAction } from "@api/enums/audit-action.enum";
import { AuditChangesInterceptor } from "@api/modules/audit/interceptors/audit-changes.interceptor";
import { ExecutionContext } from "@nestjs/common";
import { of, lastValueFrom } from 'rxjs';

describe("SettingController", () => {
  let settingsController: SettingController;
  let settingsServiceMock: DeepMockProxy<SettingService>;
  let auditServiceMock: DeepMockProxy<AuditService>;
  let prismaServiceMock: DeepMockProxy<PrismaService>;
  let auditInterceptor: AuditChangesInterceptor;

  const mockContext = (method: string) => ({
    switchToHttp: () => ({
      getRequest: () => ({
        method,
        user: { id: '1' },
        ip: '127.0.0.1',
        path: '/settings',
        get: () => 'test-user-agent',
        params: { key: 'site_name' }
      }),
      getResponse: () => ({}),
      getNext: () => jest.fn(),
    }),
    getHandler: () => jest.fn(),
    getType: () => 'http',
    getClass: () => SettingController,
    getArgs: () => [],
    getArgByIndex: () => null,
    switchToRpc: () => null,
    switchToWs: () => null,
  });

  const setupTest = async (metadata = { action: AuditAction.CREATE, model: 'Setting' }) => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingController],
      providers: [
        { provide: SettingService, useValue: settingsServiceMock },
        { provide: AuditService, useValue: auditServiceMock },
        { provide: PrismaService, useValue: prismaServiceMock },
        Reflector,
      ],
    }).compile();

    settingsController = module.get<SettingController>(SettingController);
    const reflector = module.get(Reflector);
    auditInterceptor = new AuditChangesInterceptor(
      reflector,
      auditServiceMock,
      prismaServiceMock
    );
  };

  beforeEach(async () => {
    settingsServiceMock = mockDeep<SettingService>();
    auditServiceMock = mockDeep<AuditService>();
    prismaServiceMock = mockDeep<PrismaService>();
    await setupTest();
  });

  describe("audit logging", () => {
    const mockSetting = {
      id: 1,
      key: "site_name",
      value: "My Site",
      description: "Website name",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should log setting creation", async () => {
      const createSettingDto = {
        key: "site_name",
        value: "My Site",
        description: "Website name"
      };

      settingsServiceMock.createSetting.mockResolvedValue(mockSetting);

      const context = mockContext('POST');
      jest.spyOn(Reflector.prototype, 'get').mockReturnValue({
        action: AuditAction.CREATE,
        model: 'Setting'
      });

      const next = {
        handle: () => of(mockSetting)
      };

      const interceptor$ = await auditInterceptor.intercept(context as ExecutionContext, next);
      await lastValueFrom(interceptor$);
      
      await settingsController.createSetting(createSettingDto);

      expect(auditServiceMock.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.CREATE,
          model: 'Setting',
          modelId: 1,
          userId: '1',
          metadata: expect.objectContaining({
            ip: '127.0.0.1',
            method: 'POST',
            path: '/settings',
            userAgent: 'test-user-agent'
          }),
          newData: expect.any(Object),
          oldData: null
        })
      );
    });

    it("should log setting update with changes", async () => {
      const updateData = {
        value: "Updated Site Name",
        description: "Updated description"
      };

      prismaServiceMock.setting.findUnique.mockResolvedValue(mockSetting);
      settingsServiceMock.updateSetting.mockResolvedValue({ ...mockSetting, ...updateData });

      const context = mockContext('PATCH');
      jest.spyOn(Reflector.prototype, 'get').mockReturnValue({
        action: AuditAction.UPDATE,
        model: 'Setting'
      });

      const next = {
        handle: () => of({ ...mockSetting, ...updateData })
      };

      const interceptor$ = await auditInterceptor.intercept(context as ExecutionContext, next);
      await lastValueFrom(interceptor$);
      
      await settingsController.updateSetting(mockSetting.key, updateData);

      expect(auditServiceMock.log).toHaveBeenCalled();
    });

    it("should log setting deletion", async () => {
      prismaServiceMock.setting.findUnique.mockResolvedValue(mockSetting);
      settingsServiceMock.deleteSetting.mockResolvedValue(mockSetting);

      const context = mockContext('DELETE');
      jest.spyOn(Reflector.prototype, 'get').mockReturnValue({
        action: AuditAction.DELETE,
        model: 'Setting'
      });

      const next = {
        handle: () => of(mockSetting)
      };

      const interceptor$ = await auditInterceptor.intercept(context as ExecutionContext, next);
      await lastValueFrom(interceptor$);
      
      await settingsController.deleteSetting(mockSetting.key);

      expect(auditServiceMock.log).toHaveBeenCalled();
    });
  });
});