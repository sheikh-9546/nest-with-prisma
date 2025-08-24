import { Controller, Query, UseGuards, Param } from '@nestjs/common';
import { AuditService } from './audit.service';
import {
  GetMapping,
  RestController,
} from '@api/core/decorators/http-mapping.decorator';
import { AuditFilterDto } from './dto/audit-pagination.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@RestController({ path: 'audits', tag: 'Audits' })
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  private convertDates(dto: AuditFilterDto) {
    return {
      ...dto,
      fromDate: dto.fromDate ? new Date(dto.fromDate) : undefined,
      toDate: dto.toDate ? new Date(dto.toDate) : undefined,
    };
  }

  @GetMapping({ path: 'list', summary: 'Allow to retrieve audit logs list' })
  async getAllAudits(@Query() auditFilterDto: AuditFilterDto) {
    return this.auditService.getAuditLogs(this.convertDates(auditFilterDto));
  }

  @GetMapping({ path: 'details/:id', summary: 'Allow to retrieve specific audit log by audit ID' })
  async getAuditById(@Param('id') auditId: string) {
    return this.auditService.getAuditById(auditId);
  }

  @GetMapping({ path: 'model-id/:id', summary: 'Allow to retrieve audit logs by model ID' })
  async getAuditsByModelId(@Param('id') modelId: string, @Query() auditFilterDto: AuditFilterDto) {
    return this.auditService.getAuditLogs({
      ...this.convertDates(auditFilterDto),
      modelId,
    });
  }

  @GetMapping({ path: 'user/:userId', summary: 'Allow to retrieve audit logs by user' })
  async getAuditsByUser(@Param('userId') userId: number, @Query() auditFilterDto: AuditFilterDto) {
    return this.auditService.getAuditLogs({
      ...this.convertDates(auditFilterDto),
      userId,
    });
  }

  @GetMapping({ path: 'model/:model', summary: 'Allow to retrieve audit logs by model type' })
  async getAuditsByModel(@Param('model') model: string, @Query() auditFilterDto: AuditFilterDto) {
    return this.auditService.getAuditLogs({
      ...this.convertDates(auditFilterDto),
      model,
    });
  }
} 