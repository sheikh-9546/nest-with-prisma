import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { StatsService } from './services/stats.service';
import { PrismaModule } from '@api/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
