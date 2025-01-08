import { PrismaService } from '@api/database/prisma.service';
import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateRoleDto } from '../dto/create-role.dto';
import { Prisma, Role } from '@prisma/client';
import { ErrorHandler } from '@api/core/error-handler';
import { Messages } from '@api/constants/messages';
import { SerializerUtil } from '@api/core/common/serializer.util';
import { RoleSerializer } from '../serializers/role.serializer';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) { }

  // Method to fetch all roles
  async getAllRoles(): Promise<any> {
    return this.prisma.role.findMany(); // Fetch all roles from the Role table
  }


  //get role find by id
  async findRoleById(roleId: number): Promise<Role | null> {
    return await this.prisma.role.findUnique({
      where: { id: roleId },
    });
  }

  // add role
  async addRole(createRoleDto: CreateRoleDto) {
    const { roleName } = createRoleDto;
    return this.prisma.role.create({
      data: {
        roleName,
      },
    });
  }

  // update role
  async UpdateRole(params: { where: Prisma.RoleWhereUniqueInput; data: Prisma.RoleUpdateInput; }): Promise<any> {
    const updateUser = await this.prisma.role.update({ where: params.where, data: params.data, });
    return SerializerUtil.serialize(updateUser, RoleSerializer);
  }

  // Method to delete a role
  async deleteRole(where: Prisma.RoleWhereUniqueInput): Promise<Role> {
    const role = await this.prisma.role.findUnique({ where });
    if (!role) {
      ErrorHandler.userNotFoundError(Messages.Role.Error.ROLE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const deleteUser = await this.prisma.role.delete({ where });
    return deleteUser;
  }
}
