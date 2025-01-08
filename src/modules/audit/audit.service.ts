import { PrismaService } from '@api/database/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuditService {
  constructor(
    private readonly prismaService: PrismaService) {}

  // Log create action
  async logCreate(userId: string, model: string, modelId: string) {
    await this.prismaService.audit.create({
      data: {
        userId,
        action: 'CREATE',
        model,
        modelId,
        changes: null, // No changes for create, just the creation action
      },
    });
  }

  // Log update action with changes
  async logUpdate(userId: string, model: string, modelId: string, changes: object) {
    await this.prismaService.audit.create({
      data: {
        userId,
        action: 'UPDATE',
        model,
        modelId,
        changes, // Store the changes as JSON
      },
    });
  }

  // Log delete action
  async logDelete(userId: string, model: string, modelId: string) {
    await this.prismaService.audit.create({
      data: {
        userId,
        action: 'DELETE',
        model,
        modelId,
        changes: null, // No changes for delete, just the deletion action
      },
    });
  }
}
