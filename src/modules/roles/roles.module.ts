import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './services/role.service';
import { PrismaService } from '@api/database/prisma.service';

@Module({
  controllers: [RolesController],
  providers: [RolesService, PrismaService],
  exports: [RolesService],
})
export class RolesModule {}
