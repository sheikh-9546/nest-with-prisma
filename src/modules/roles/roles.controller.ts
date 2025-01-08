import { DeleteMapping, GetMapping, PatchMapping, PostMapping, RestController } from '@api/core/decorators/http-mapping.decorator';
import { Controller, Body, Param } from '@nestjs/common';
import { RolesService } from './services/role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { Role } from '@prisma/client';
import { UpdateRoleDto } from './dto/update-role.dto';

@RestController({ path: 'roles', tag: 'roles' })
@Controller('roles')
export class RolesController {
    constructor(private readonly rolesService: RolesService) { }

    @GetMapping({ summary: 'Allow to retrieve all roles' })
    async getAllRoles(): Promise<any> {
        return this.rolesService.getAllRoles();
    }

    @PostMapping({ summary: 'Allow to create a role' })
    async addRole(@Body() createRoleDto: CreateRoleDto) {
        return this.rolesService.addRole(createRoleDto);
    }

    // @PatchMapping({ path: ':id', summary: 'Update role' })
    // async updateRole(
    //     @Param('id') id: Number,
    //     @Body() roleData: UpdateRoleDto,
    // ): Promise<Role> {
    //     return this.rolesService.UpdateRole({ where: { id: id }, data: roleData });
    // }

    @DeleteMapping({ path: ':id', summary: 'Allow to delete a role' })
    async deleteUser(@Param('id') id: string): Promise<Role> {
        return this.rolesService.deleteRole({ id: Number(id) });
    }

}
