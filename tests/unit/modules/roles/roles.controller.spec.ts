import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from '@api/modules/roles/roles.controller';
import { RolesService } from '@api/modules/roles/services/role.service';
import { CreateRoleDto } from '@api/modules/roles/dto/create-role.dto';

describe('RolesController', () => {
  let controller: RolesController;
  let rolesService: RolesService;

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

  const mockRolesService = {
    getAllRoles: jest.fn(),
    addRole: jest.fn(),
    deleteRole: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: mockRolesService,
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
    rolesService = module.get<RolesService>(RolesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllRoles', () => {
    it('should return all roles', async () => {
      mockRolesService.getAllRoles.mockResolvedValue(mockRoles);

      const result = await controller.getAllRoles();

      expect(result).toEqual(mockRoles);
      expect(mockRolesService.getAllRoles).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no roles exist', async () => {
      mockRolesService.getAllRoles.mockResolvedValue([]);

      const result = await controller.getAllRoles();

      expect(result).toEqual([]);
      expect(mockRolesService.getAllRoles).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors', async () => {
      const error = new Error('Database connection error');
      mockRolesService.getAllRoles.mockRejectedValue(error);

      await expect(controller.getAllRoles()).rejects.toThrow(error);
      expect(mockRolesService.getAllRoles).toHaveBeenCalledTimes(1);
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

      mockRolesService.addRole.mockResolvedValue(createdRole);

      const result = await controller.addRole(createRoleDto);

      expect(result).toEqual(createdRole);
      expect(mockRolesService.addRole).toHaveBeenCalledWith(createRoleDto);
    });

    it('should handle validation errors', async () => {
      const createRoleDto: CreateRoleDto = {
        roleName: '',
      };
      const error = new Error('Role name is required');

      mockRolesService.addRole.mockRejectedValue(error);

      await expect(controller.addRole(createRoleDto)).rejects.toThrow(error);
      expect(mockRolesService.addRole).toHaveBeenCalledWith(createRoleDto);
    });

    it('should handle duplicate role name errors', async () => {
      const createRoleDto: CreateRoleDto = {
        roleName: 'Admin',
      };
      const error = new Error('Role name already exists');

      mockRolesService.addRole.mockRejectedValue(error);

      await expect(controller.addRole(createRoleDto)).rejects.toThrow(error);
      expect(mockRolesService.addRole).toHaveBeenCalledWith(createRoleDto);
    });
  });

  describe('deleteUser', () => {
    it('should delete a role by id', async () => {
      const roleId = '1';
      mockRolesService.deleteRole.mockResolvedValue(mockRole);

      const result = await controller.deleteUser(roleId);

      expect(result).toEqual(mockRole);
      expect(mockRolesService.deleteRole).toHaveBeenCalledWith({
        id: Number(roleId),
      });
    });

    it('should handle role not found errors', async () => {
      const roleId = '999';
      const error = new Error('Role not found');

      mockRolesService.deleteRole.mockRejectedValue(error);

      await expect(controller.deleteUser(roleId)).rejects.toThrow(error);
      expect(mockRolesService.deleteRole).toHaveBeenCalledWith({
        id: Number(roleId),
      });
    });

    it('should handle invalid id format', async () => {
      const roleId = 'invalid-id';
      mockRolesService.deleteRole.mockResolvedValue(mockRole);

      const result = await controller.deleteUser(roleId);

      expect(result).toEqual(mockRole);
      expect(mockRolesService.deleteRole).toHaveBeenCalledWith({
        id: NaN, // Number('invalid-id') returns NaN
      });
    });

    it('should handle database errors during deletion', async () => {
      const roleId = '1';
      const error = new Error('Database connection error');

      mockRolesService.deleteRole.mockRejectedValue(error);

      await expect(controller.deleteUser(roleId)).rejects.toThrow(error);
      expect(mockRolesService.deleteRole).toHaveBeenCalledWith({
        id: Number(roleId),
      });
    });
  });
});
