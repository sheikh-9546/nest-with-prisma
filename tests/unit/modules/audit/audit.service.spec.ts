import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuditService } from '@api/modules/audit/audit.service';
import { PrismaService } from '@api/database/prisma.service';
import { CreateAuditDto } from '@api/modules/audit/dto/create-audit.dto';
import { AuditAction } from '@api/enums/audit-action.enum';

describe('AuditService', () => {
  let service: AuditService;
  let prismaService: PrismaService;
  let eventEmitter: EventEmitter2;

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

  const mockAuditLogs = [
    mockAuditLog,
    {
      id: 2,
      userId: 1,
      action: AuditAction.UPDATE,
      model: 'User',
      modelId: '1',
      changes: {
        old: { name: 'John Doe' },
        new: { name: 'John Smith' },
      },
      duration: 120,
      metadata: { ip: '192.168.1.1' },
      createdAt: new Date(),
      user: {
        id: 1,
        userId: 'user-uuid-123',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john@example.com',
      },
    },
  ];

  const mockPrismaService = {
    audit: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    prismaService = module.get<PrismaService>(PrismaService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('log', () => {
    it('should create audit log successfully', async () => {
      const auditData: CreateAuditDto = {
        userId: 1,
        action: AuditAction.CREATE,
        model: 'User',
        modelId: '1',
        oldData: null,
        newData: { name: 'John Doe', email: 'john@example.com' },
        duration: 150,
        metadata: { ip: '192.168.1.1', method: 'POST', path: '/api/users', userAgent: 'Mozilla/5.0' },
      };

      mockPrismaService.audit.create.mockResolvedValue(mockAuditLog);

      await service.log(auditData);

      expect(mockEventEmitter.emit).toHaveBeenCalledWith('audit.log', auditData);
      expect(mockPrismaService.audit.create).toHaveBeenCalledWith({
        data: {
          userId: auditData.userId,
          action: auditData.action,
          model: auditData.model,
          modelId: auditData.modelId,
          changes: {
            old: auditData.oldData,
            new: auditData.newData,
          },
          duration: auditData.duration,
          metadata: auditData.metadata,
        },
      });
    });

    it('should handle database errors gracefully', async () => {
      const auditData: CreateAuditDto = {
        userId: 1,
        action: AuditAction.CREATE,
        model: 'User',
        modelId: '1',
        oldData: null,
        newData: { name: 'John Doe' },
        duration: 100,
        metadata: { ip: '192.168.1.1', method: 'POST', path: '/api/users', userAgent: 'Mozilla/5.0' },
      };

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Database connection failed');
      mockPrismaService.audit.create.mockRejectedValue(error);

      // Should not throw error
      await expect(service.log(auditData)).resolves.toBeUndefined();

      expect(consoleSpy).toHaveBeenCalledWith('Audit logging failed:', error);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('audit.log', auditData);

      consoleSpy.mockRestore();
    });
  });

  describe('getAuditLogs', () => {
    it('should return paginated audit logs', async () => {
      const filters = {
        userId: 1,
        page: 1,
        limit: 10,
      };

      const expectedResponse = {
        data: mockAuditLogs,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      };

      mockPrismaService.audit.findMany.mockResolvedValue(mockAuditLogs);
      mockPrismaService.audit.count.mockResolvedValue(2);

      const result = await service.getAuditLogs(filters);

      expect(result).toEqual(expectedResponse);
      expect(mockPrismaService.audit.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: {
          user: {
            select: {
              id: true,
              userId: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      });
      expect(mockPrismaService.audit.count).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
    });

    it('should filter by date range', async () => {
      const filters = {
        fromDate: new Date('2024-01-01'),
        toDate: new Date('2024-12-31'),
        page: 1,
        limit: 10,
      };

      mockPrismaService.audit.findMany.mockResolvedValue([]);
      mockPrismaService.audit.count.mockResolvedValue(0);

      await service.getAuditLogs(filters);

      expect(mockPrismaService.audit.findMany).toHaveBeenCalledWith({
        where: {
          createdAt: {
            gte: filters.fromDate,
            lte: filters.toDate,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              userId: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      });
    });

    it('should filter by model and action', async () => {
      const filters = {
        model: 'User',
        action: AuditAction.UPDATE,
        page: 1,
        limit: 10,
      };

      mockPrismaService.audit.findMany.mockResolvedValue([]);
      mockPrismaService.audit.count.mockResolvedValue(0);

      await service.getAuditLogs(filters);

      expect(mockPrismaService.audit.findMany).toHaveBeenCalledWith({
        where: {
          model: 'User',
          action: AuditAction.UPDATE,
        },
        include: {
          user: {
            select: {
              id: true,
              userId: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      });
    });
  });

  describe('getAuditById', () => {
    it('should return audit log by id', async () => {
      const auditId = '1';
      mockPrismaService.audit.findUnique.mockResolvedValue(mockAuditLog);

      const result = await service.getAuditById(auditId);

      expect(result).toEqual(mockAuditLog);
      expect(mockPrismaService.audit.findUnique).toHaveBeenCalledWith({
        where: { id: auditId },
        include: {
          user: {
            select: {
              id: true,
              userId: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });
    });

    it('should return null when audit log not found', async () => {
      const auditId = '999';
      mockPrismaService.audit.findUnique.mockResolvedValue(null);

      const result = await service.getAuditById(auditId);

      expect(result).toBeNull();
      expect(mockPrismaService.audit.findUnique).toHaveBeenCalledWith({
        where: { id: auditId },
        include: {
          user: {
            select: {
              id: true,
              userId: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });
    });
  });

  describe('logCreate', () => {
    it('should log create action', async () => {
      const userId = 1;
      const model = 'User';
      const modelId = '1';
      const newData = { name: 'John Doe', email: 'john@example.com' };
      const metadata = { ip: '192.168.1.1' };

      mockPrismaService.audit.create.mockResolvedValue(mockAuditLog);

      await service.logCreate(userId, model, modelId, metadata);

      expect(mockPrismaService.audit.create).toHaveBeenCalledWith({
        data: {
          userId,
          action: AuditAction.CREATE,
          model,
          modelId,
          changes: {
            old: null,
            new: newData,
          },
          metadata,
        },
      });
    });
  });

  describe('logUpdate', () => {
    it('should log update action', async () => {
      const userId = 1;
      const model = 'User';
      const modelId = '1';
      const oldData = { name: 'John Doe' };
      const newData = { name: 'John Smith' };
      const metadata = { ip: '192.168.1.1' };

      mockPrismaService.audit.create.mockResolvedValue(mockAuditLog);

      await service.logUpdate(userId, model, modelId, { before: oldData, after: newData }, metadata);

      expect(mockPrismaService.audit.create).toHaveBeenCalledWith({
        data: {
          userId,
          action: AuditAction.UPDATE,
          model,
          modelId,
          changes: {
            old: oldData,
            new: newData,
          },
          metadata,
        },
      });
    });
  });

  describe('logDelete', () => {
    it('should log delete action', async () => {
      const userId = 1;
      const model = 'User';
      const modelId = '1';
      const oldData = { name: 'John Doe', email: 'john@example.com' };
      const metadata = { ip: '192.168.1.1' };

      mockPrismaService.audit.create.mockResolvedValue(mockAuditLog);

      await service.logDelete(userId, model, modelId, metadata);

      expect(mockPrismaService.audit.create).toHaveBeenCalledWith({
        data: {
          userId,
          action: AuditAction.DELETE,
          model,
          modelId,
          changes: {
            old: oldData,
            new: null,
          },
          metadata,
        },
      });
    });
  });
});
