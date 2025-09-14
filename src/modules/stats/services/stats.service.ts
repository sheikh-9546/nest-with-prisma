import { Injectable } from '@nestjs/common';
import { PrismaService } from '@api/database/prisma.service';
import { Status } from '@api/enums/status.enum';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserStats() {
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      suspendedUsers,
      adminUsers,
      moderatorUsers,
      regularUsers,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: Status.ACTIVE } }),
      this.prisma.user.count({ where: { status: Status.INACTIVE } }),
      this.prisma.user.count({ where: { status: Status.PENDING } }), // Assuming PENDING means suspended
      this.prisma.user.count({
        where: {
          userRoles: {
            some: {
              role: {
                roleName: 'admin',
              },
            },
          },
        },
      }),
      this.prisma.user.count({
        where: {
          userRoles: {
            some: {
              role: {
                roleName: 'moderator',
              },
            },
          },
        },
      }),
      this.prisma.user.count({
        where: {
          userRoles: {
            some: {
              role: {
                roleName: 'user',
              },
            },
          },
        },
      }),
    ]);

    return {
      total: totalUsers,
      active: activeUsers,
      inactive: inactiveUsers,
      suspended: suspendedUsers,
      admins: adminUsers,
      moderators: moderatorUsers,
      regularUsers: regularUsers,
    };
  }

  async getDashboardStats() {
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalRoles,
      recentLogins,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: Status.ACTIVE } }),
      this.prisma.user.count({ where: { status: Status.INACTIVE } }),
      this.prisma.role.count(),
      this.prisma.user.count({
        where: {
          lastLoginAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
    ]);

    // Simple system health check based on recent activity
    const systemHealth = recentLogins > 0 ? 'good' : 'warning';

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalRoles,
      recentLogins,
      systemHealth,
    };
  }
}
