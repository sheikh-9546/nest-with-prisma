import { Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { GetMapping, RestController } from '@api/core/decorators/http-mapping.decorator';
import { StatsService } from './services/stats.service';

@RestController({ path: 'stats', tag: 'Statistics' })
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @GetMapping({ path: 'users', summary: 'Get user statistics' })
  async getUserStats() {
    return this.statsService.getUserStats();
  }

  @GetMapping({ path: 'dashboard', summary: 'Get dashboard statistics' })
  async getDashboardStats() {
    return this.statsService.getDashboardStats();
  }
}
