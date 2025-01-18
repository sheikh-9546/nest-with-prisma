import { Body, Controller, Param, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from '@api/modules/users/services/user.service';
import { User } from '@prisma/client';
import {
  DeleteMapping,
  GetMapping,
  PatchMapping,
  PostMapping,
  RestController,
} from '@api/core/decorators/http-mapping.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserSerializer } from './serializers/user.serializer';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdateUserStatusDto } from './dto/update-user.status.dto';
import { UserDetailsSerializer } from './serializers/user.details.serializer';
import { ChangePasswordDto } from '@api/interface/dto/change-password.dto';
import { Request } from 'express';
import { UploadProfileDto } from './dto/upload-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '@api/core/common/multer.config';
import { Express } from 'express';
import { FileUploadDestination } from '@api/enums/file-upload-destination.enum';
import { AuditInterceptor } from '@api/modules/audit/interceptors/audit.interceptor';
import { Audit } from '@api/modules/audit/decorators/audit.decorator';
import { AuditChangesInterceptor } from '@api/modules/audit/interceptors/audit-changes.interceptor';
import { AuditAction } from '@api/enums/audit-action.enum';

@RestController({ path: 'users', tag: 'Users' })
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(AuditInterceptor)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @GetMapping({ path: 'list', summary: 'Allow to retrieve users list' })
  async getAllUsers(@Query() paginationDto: PaginationDto) {
    const { page, limit, sort_column, sort_direction } = paginationDto;
    return this.userService.getAllUsers(page, limit, sort_column, sort_direction);
  }

  @GetMapping({ path: ':id', summary: 'Allow to retrieve user details' })
  async getUser(@Param('id') id: string): Promise<UserDetailsSerializer> {
    return this.userService.getUserDetails({ id: id });
  }

  @PostMapping({ path: 'create-user', summary: 'Allow to create a user' })
  @Audit({ action: AuditAction.CREATE, model: 'User' })
  async createUser(@Body() data: CreateUserDto): Promise<UserSerializer> {
    return this.userService.createUser(data);
  }

  @PatchMapping({ path: ':id', summary: 'Allow to update user details' })
  @Audit({ action: AuditAction.UPDATE, model: 'User' })
  @UseInterceptors(AuditChangesInterceptor)
  async updateUser(
    @Param('id') id: string,
    @Body() userData: UpdateUserDto,
  ): Promise<User> {
    return this.userService.updateUser({ where: { id }, data: userData });
  }

  @PatchMapping({ path: ':id/status', summary: 'Allow to update user status' })
  @Audit({ action: AuditAction.UPDATE_STATUS, model: 'User' })
  @UseInterceptors(AuditChangesInterceptor)
  async updateUserStatus(@Param('id') id: string, @Body() updateUserStatusDto: UpdateUserStatusDto) {
    return this.userService.updateUserStatus(id, updateUserStatusDto.status);
  }

  @DeleteMapping({ path: ':id', summary: 'Delete a user' })
  @Audit({ action: AuditAction.DELETE, model: 'User' })
  async deleteUser(@Param('id') id: string): Promise<User> {
    return this.userService.deleteUser({ id: id });
  }

  @PostMapping({ path: 'change-password', summary: 'Allow to change Password' })
  @Audit({ action: AuditAction.CHANGE_PASSWORD, model: 'User' })
  async changePassword(@Req() req: Request, @Body() changePasswordDto: ChangePasswordDto) {
    const userId = req.user?.id;
    return this.userService.changePassword(userId, changePasswordDto.currentPassword, changePasswordDto.newPassword);
  }

  @PostMapping({ path: 'upload-profile-image', summary: 'Allow to upload profile Image' })
  @UseInterceptors(FileInterceptor('file', multerConfig(FileUploadDestination.userProfile)))
  @Audit({ action: AuditAction.UPLOAD_PROFILE_IMAGE, model: 'User' })
  async uploadProfile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
    @Body() uploadProfileDto: UploadProfileDto,
  ) {
    const userId = req.user?.id;
    const filePath = `uploads/profiles/${file.filename}`;
    return this.userService.updateUserProfileImage(userId, filePath);
  }
}
