import { Body, Controller, Param, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { SettingService } from './setting.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuditInterceptor } from '@api/modules/audit/interceptors/audit.interceptor';
import { Audit } from '@api/modules/audit/decorators/audit.decorator';
import { AuditAction } from '@api/enums/audit-action.enum';
import { AuditChangesInterceptor } from '@api/modules/audit/interceptors/audit-changes.interceptor';
import { PaginationDto } from '../common/dto/pagination.dto';
import {
  DeleteMapping,
  GetMapping,
  PatchMapping,
  PostMapping,
  RestController,
} from '@api/core/decorators/http-mapping.decorator';
import { SettingSerializer } from './serializers/setting.serializer';

@RestController({ path: 'setting', tag: 'Settings' })
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(AuditInterceptor)
@Controller('setting')
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @GetMapping({ path: 'list', summary: 'Allow to retrieve settings list' })
  async getAllSettings(@Query() paginationDto: PaginationDto) {
    const { page, limit, sort_column, sort_direction } = paginationDto;
    return this.settingService.getAllSettings(page, limit, sort_column, sort_direction);
  }

  @GetMapping({ path: ':key', summary: 'Allow to retrieve setting details' })
  async getSetting(@Param('key') key: string): Promise<SettingSerializer> {
    return this.settingService.getSettingDetails({ key });
  }

  @PostMapping({ path: 'create', summary: 'Allow to create a setting' })
  @Audit({ action: AuditAction.CREATE, model: 'Setting' })
  async createSetting(@Body() data: CreateSettingDto): Promise<SettingSerializer> {
    return this.settingService.createSetting(data);
  }

  @PatchMapping({ path: ':key', summary: 'Allow to update setting details' })
  @Audit({ action: AuditAction.UPDATE, model: 'Setting' })
  @UseInterceptors(AuditChangesInterceptor)
  async updateSetting(
    @Param('key') key: string,
    @Body() settingData: UpdateSettingDto,
  ): Promise<SettingSerializer> {
    return this.settingService.updateSetting({ where: { key }, data: settingData });
  }

  @DeleteMapping({ path: ':key', summary: 'Delete a setting' })
  @Audit({ action: AuditAction.DELETE, model: 'Setting' })
  async deleteSetting(@Param('key') key: string): Promise<SettingSerializer> {
    return this.settingService.deleteSetting({ key });
  }
} 