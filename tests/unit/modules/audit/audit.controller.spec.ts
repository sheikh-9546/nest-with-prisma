import { Test, TestingModule } from '@nestjs/testing';
import { AuditController } from '@api/modules/audit/audit.controller';
import { AuditService } from '@api/modules/audit/audit.service';
import { AuditFilterDto } from '@api/modules/audit/dto/audit-pagination.dto';
import { AuditAction } from '@api/enums/audit-action.enum';

describe('AuditController', () => {
  let controller: AuditController;
  let auditService: AuditService;

  const mockAuditLog = {
    id: 1,
    userId: 1,
    action: AuditAction.CREATE,
    model: 'User',
    modelId: '1',
    changes: {
      old: null,
      new: { name: 'John Doe', email: 'john@example.com' },
    },
    duration: 150,
    metadata: { ip: '192.168.1.1', userAgent: 'Mozilla/5.0' },
    createdAt: new Date(),
    user: {
      id: 1,
      userId: 'user-uuid-123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    },
  };

  const mockPaginatedResponse = {
    data: [mockAuditLog],
    pagination: {
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    },
  };

  const mockAuditService = {
    getAuditLogs: jest.fn(),
    getAuditById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditController],
      providers: [
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    controller = module.get<AuditController>(AuditController);
    auditService = module.get<AuditService>(AuditService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllAudits', () => {
    it('should return all audit logs with pagination', async () => {
      const filterDto: AuditFilterDto = {
        page: 1,
        limit: 10,
      };

      mockAuditService.getAuditLogs.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.getAllAudits(filterDto);

      expect(result).toEqual(mockPaginatedResponse);
      expect(mockAuditService.getAuditLogs).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
    });

    it('should handle date filters', async () => {
      const filterDto: AuditFilterDto = {
        page: 1,
        limit: 10,
        fromDate: '2024-01-01',
        toDate: '2024-12-31',
      };

      mockAuditService.getAuditLogs.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.getAllAudits(filterDto);

      expect(result).toEqual(mockPaginatedResponse);
      expect(mockAuditService.getAuditLogs).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        fromDate: new Date('2024-01-01'),
        toDate: new Date('2024-12-31'),
      });
    });
  });

  describe('getAuditsByModelId', () => {
    it('should return audit logs filtered by model ID', async () => {
      const modelId = '1';
      const filterDto: AuditFilterDto = {
        page: 1,
        limit: 10,
      };

      mockAuditService.getAuditLogs.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.getAuditsByModelId(modelId, filterDto);

      expect(result).toEqual(mockPaginatedResponse);
      expect(mockAuditService.getAuditLogs).toHaveBeenCalledWith({
        modelId,
        page: 1,
        limit: 10,
      });
    });
  });

  describe('getAuditsByUser', () => {
    it('should return audit logs filtered by user ID', async () => {
      const userId = 1;
      const filterDto: AuditFilterDto = {
        page: 1,
        limit: 10,
      };

      mockAuditService.getAuditLogs.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.getAuditsByUser(userId, filterDto);

      expect(result).toEqual(mockPaginatedResponse);
      expect(mockAuditService.getAuditLogs).toHaveBeenCalledWith({
        userId: 1,
        page: 1,
        limit: 10,
      });
    });

    it('should handle invalid user ID', async () => {
      const userId = 999;
      const filterDto: AuditFilterDto = {
        page: 1,
        limit: 10,
      };

      mockAuditService.getAuditLogs.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.getAuditsByUser(userId, filterDto);

      expect(result).toEqual(mockPaginatedResponse);
      expect(mockAuditService.getAuditLogs).toHaveBeenCalledWith({
        userId: 999,
        page: 1,
        limit: 10,
      });
    });
  });

  describe('getAuditsByModel', () => {
    it('should return audit logs filtered by model', async () => {
      const model = 'User';
      const filterDto: AuditFilterDto = {
        page: 1,
        limit: 10,
      };

      mockAuditService.getAuditLogs.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.getAuditsByModel(model, filterDto);

      expect(result).toEqual(mockPaginatedResponse);
      expect(mockAuditService.getAuditLogs).toHaveBeenCalledWith({
        model,
        page: 1,
        limit: 10,
      });
    });
  });

  describe('getAuditById', () => {
    it('should return audit log details by ID', async () => {
      const auditId = '1';
      mockAuditService.getAuditById.mockResolvedValue(mockAuditLog);

      const result = await controller.getAuditById(auditId);

      expect(result).toEqual(mockAuditLog);
      expect(mockAuditService.getAuditById).toHaveBeenCalledWith(auditId);
    });

    it('should handle invalid audit ID', async () => {
      const auditId = 'invalid';
      mockAuditService.getAuditById.mockResolvedValue(null);

      const result = await controller.getAuditById(auditId);

      expect(result).toBeNull();
      expect(mockAuditService.getAuditById).toHaveBeenCalledWith(auditId);
    });

    it('should return null when audit not found', async () => {
      const auditId = '999';
      mockAuditService.getAuditById.mockResolvedValue(null);

      const result = await controller.getAuditById(auditId);

      expect(result).toBeNull();
      expect(mockAuditService.getAuditById).toHaveBeenCalledWith(auditId);
    });
  });

  describe('error handling', () => {
    it('should handle service errors in getAllAudits', async () => {
      const filterDto: AuditFilterDto = {
        page: 1,
        limit: 10,
      };
      const error = new Error('Database connection error');

      mockAuditService.getAuditLogs.mockRejectedValue(error);

      await expect(controller.getAllAudits(filterDto)).rejects.toThrow(error);
      expect(mockAuditService.getAuditLogs).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
    });

    it('should handle service errors in getAuditDetails', async () => {
      const auditId = '1';
      const error = new Error('Database connection error');

      mockAuditService.getAuditById.mockRejectedValue(error);

      await expect(controller.getAuditById(auditId)).rejects.toThrow(error);
      expect(mockAuditService.getAuditById).toHaveBeenCalledWith(auditId);
    });
  });
});


