import { Controller, Query, UseGuards, Param } from '@nestjs/common';
import { AuditService } from './audit.service';
import {
  GetMapping,
  RestController,
} from '@api/core/decorators/http-mapping.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@RestController({ path: 'audits', tag: 'Audits' })
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @GetMapping({ path: 'list', summary: 'Allow to retrieve audit logs list' })
  async getAllAudits(@Query() paginationDto: PaginationDto) {
    const { page, limit, sort_column, sort_direction } = paginationDto;
    return this.auditService.getAuditLogs({
      page,
      limit,
      // Additional filters can be added here
    });
  }

  @GetMapping({ path: ':id', summary: 'Allow to retrieve audit log details by model ID' })
  async getAuditsByModelId(@Param('id') modelId: string) {
    return this.auditService.getAuditLogs({
      modelId,
      limit: 100, // You might want to adjust this limit
    });
  }

  @GetMapping({ path: 'user/:userId', summary: 'Allow to retrieve audit logs by user' })
  async getAuditsByUser(@Param('userId') userId: string) {
    return this.auditService.getAuditLogs({
      userId,
      limit: 100, // You might want to adjust this limit
    });
  }

  @GetMapping({ path: 'model/:model', summary: 'Allow to retrieve audit logs by model type' })
  async getAuditsByModel(@Param('model') model: string) {
    return this.auditService.getAuditLogs({
      model,
      limit: 100, // You might want to adjust this limit
    });
  }
} 