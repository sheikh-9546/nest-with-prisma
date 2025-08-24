import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { RolesService } from '@api/modules/roles/services/role.service';
import { PrismaService } from '@api/database/prisma.service';
import { CreateRoleDto } from '@api/modules/roles/dto/create-role.dto';
import { ErrorHandler } from '@api/core/error-handler';
import { Messages } from '@api/constants/messages';

describe('RolesService', () => {
  let service: RolesService;
  let prismaService: PrismaService;

  const mockRole = {
    id: 1,
    roleName: 'Admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRoles = [
    mockRole,
    {
      id: 2,
      roleName: 'User',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      roleName: 'Moderator',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockPrismaService = {
    role: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllRoles', () => {
    it('should return all roles', async () => {
      mockPrismaService.role.findMany.mockResolvedValue(mockRoles);

      const result = await service.getAllRoles();

      expect(result).toEqual(mockRoles);
      expect(mockPrismaService.role.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no roles exist', async () => {
      mockPrismaService.role.findMany.mockResolvedValue([]);

      const result = await service.getAllRoles();

      expect(result).toEqual([]);
      expect(mockPrismaService.role.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('findRoleById', () => {
    it('should return a role by id', async () => {
      const roleId = 1;
      mockPrismaService.role.findUnique.mockResolvedValue(mockRole);

      const result = await service.findRoleById(roleId);

      expect(result).toEqual(mockRole);
      expect(mockPrismaService.role.findUnique).toHaveBeenCalledWith({
        where: { id: roleId },
      });
    });

    it('should return null when role not found', async () => {
      const roleId = 999;
      mockPrismaService.role.findUnique.mockResolvedValue(null);

      const result = await service.findRoleById(roleId);

      expect(result).toBeNull();
      expect(mockPrismaService.role.findUnique).toHaveBeenCalledWith({
        where: { id: roleId },
      });
    });
  });

  describe('addRole', () => {
    it('should create a new role', async () => {
      const createRoleDto: CreateRoleDto = {
        roleName: 'New Role',
      };
      const createdRole = {
        id: 4,
        roleName: 'New Role',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.role.create.mockResolvedValue(createdRole);

      const result = await service.addRole(createRoleDto);

      expect(result).toEqual(createdRole);
      expect(mockPrismaService.role.create).toHaveBeenCalledWith({
        data: {
          roleName: createRoleDto.roleName,
        },
      });
    });

    it('should handle database errors when creating role', async () => {
      const createRoleDto: CreateRoleDto = {
        roleName: 'Duplicate Role',
      };
      const error = new Error('Unique constraint violation');

      mockPrismaService.role.create.mockRejectedValue(error);

      await expect(service.addRole(createRoleDto)).rejects.toThrow(error);
      expect(mockPrismaService.role.create).toHaveBeenCalledWith({
        data: {
          roleName: createRoleDto.roleName,
        },
      });
    });
  });

  describe('UpdateRole', () => {
    it('should update a role successfully', async () => {
      const updateParams = {
        where: { id: 1 },
        data: { roleName: 'Updated Role' },
      };
      const updatedRole = {
        ...mockRole,
        roleName: 'Updated Role',
        updatedAt: new Date(),
      };

      mockPrismaService.role.update.mockResolvedValue(updatedRole);

      const result = await service.UpdateRole(updateParams);

      expect(result).toBeDefined();
      expect(mockPrismaService.role.update).toHaveBeenCalledWith({
        where: updateParams.where,
        data: updateParams.data,
      });
    });

    it('should handle update errors', async () => {
      const updateParams = {
        where: { id: 999 },
        data: { roleName: 'Updated Role' },
      };
      const error = new Error('Record not found');

      mockPrismaService.role.update.mockRejectedValue(error);

      await expect(service.UpdateRole(updateParams)).rejects.toThrow(error);
      expect(mockPrismaService.role.update).toHaveBeenCalledWith({
        where: updateParams.where,
        data: updateParams.data,
      });
    });
  });

  describe('deleteRole', () => {
    it('should delete a role successfully', async () => {
      const where = { id: 1 };
      mockPrismaService.role.findUnique.mockResolvedValue(mockRole);
      mockPrismaService.role.delete.mockResolvedValue(mockRole);

      const result = await service.deleteRole(where);

      expect(result).toEqual(mockRole);
      expect(mockPrismaService.role.findUnique).toHaveBeenCalledWith({ where });
      expect(mockPrismaService.role.delete).toHaveBeenCalledWith({ where });
    });

    it('should throw error when role not found for deletion', async () => {
      const where = { id: 999 };
      mockPrismaService.role.findUnique.mockResolvedValue(null);

      // Mock the ErrorHandler.userNotFoundError method
      const errorHandlerSpy = jest.spyOn(ErrorHandler, 'userNotFoundError').mockImplementation(() => {
        throw new Error(Messages.Role.Error.ROLE_NOT_FOUND);
      });

      await expect(service.deleteRole(where)).rejects.toThrow(
        Messages.Role.Error.ROLE_NOT_FOUND,
      );

      expect(mockPrismaService.role.findUnique).toHaveBeenCalledWith({ where });
      expect(errorHandlerSpy).toHaveBeenCalledWith(
        Messages.Role.Error.ROLE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
      expect(mockPrismaService.role.delete).not.toHaveBeenCalled();

      errorHandlerSpy.mockRestore();
    });

    it('should handle database errors during deletion', async () => {
      const where = { id: 1 };
      const error = new Error('Database connection error');

      mockPrismaService.role.findUnique.mockResolvedValue(mockRole);
      mockPrismaService.role.delete.mockRejectedValue(error);

      await expect(service.deleteRole(where)).rejects.toThrow(error);
      expect(mockPrismaService.role.findUnique).toHaveBeenCalledWith({ where });
      expect(mockPrismaService.role.delete).toHaveBeenCalledWith({ where });
    });
  });
});
