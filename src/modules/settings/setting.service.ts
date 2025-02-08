import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@api/database/prisma.service';
import { Prisma, Setting } from '@prisma/client';
import { SettingSerializer } from '@api/modules/settings/serializers/setting.serializer';
import { SerializerUtil } from '@api/core/common/serializer.util';
import { PaginationResult, PaginationUtil } from '@api/core/common/utils/pagination.util';

@Injectable()
export class SettingService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  private logger = new Logger('Settings service');

  async getSettingDetails(
    settingWhereUniqueInput: Prisma.SettingWhereUniqueInput,
  ): Promise<any | null> {
    const setting = await this.prisma.setting.findUnique({
      where: settingWhereUniqueInput,
    });

    if (!setting) {
      throw new ConflictException('Setting not found');
    }

    return SerializerUtil.serialize(setting, SettingSerializer);
  }

  async getAllSettings(
    page: number = 1,
    limit: number = 10,
    sort_column: string,
    sort_direction: string,
  ): Promise<PaginationResult<any>> {
    const { skip, take } = PaginationUtil.getPaginationParams(page, limit);
    const [settings, totalCount] = await Promise.all([
      this.prisma.setting.findMany({
        skip,
        take,
        orderBy: {
          [sort_column]: sort_direction,
        },
      }),
      this.prisma.setting.count(),
    ]);

    const serializedSettings = settings.map((setting) =>
      SerializerUtil.serialize(setting, SettingSerializer),
    );

    return PaginationUtil.paginate(serializedSettings, totalCount, page, take);
  }

  async findSettingByKey(key: string): Promise<Setting | null> {
    return this.prisma.setting.findUnique({
      where: { key },
    });
  }

  async createSetting(data: Prisma.SettingCreateInput): Promise<any> {
    const { key } = data;

    const keyExists = await this.findSettingByKey(key);
    if (keyExists) {
      throw new ConflictException(`Setting with key "${key}" already exists`);
    }

    const newSetting = await this.prisma.setting.create({
      data,
    });

    return SerializerUtil.serialize(newSetting, SettingSerializer);
  }

  async updateSetting(params: {
    where: Prisma.SettingWhereUniqueInput;
    data: Prisma.SettingUpdateInput;
  }): Promise<any> {
    const updateSetting = await this.prisma.setting.update({
      where: params.where,
      data: params.data,
    });
    return SerializerUtil.serialize(updateSetting, SettingSerializer);
  }

  async deleteSetting(where: Prisma.SettingWhereUniqueInput): Promise<Setting> {
    this.logger.log('deleteSetting');
    const setting = await this.prisma.setting.findUnique({ where });
    if (!setting) {
      throw new NotFoundException('Setting not found');
    }
    return this.prisma.setting.delete({ where });
  }
} 