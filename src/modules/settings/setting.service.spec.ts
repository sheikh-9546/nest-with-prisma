import { Test, TestingModule } from '@nestjs/testing';
import { SettingService } from './setting.service';
import { PrismaService } from '@api/database/prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { ConflictException } from '@nestjs/common';

describe('SettingService', () => {
  let service: SettingService;
  let prismaServiceMock: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    prismaServiceMock = mockDeep<PrismaService>();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    service = module.get<SettingService>(SettingService);
  });

  const mockSetting = {
    id: 1,
    key: 'site_name',
    value: 'My Site',
    description: 'Website name',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('createSetting', () => {
    it('should create a setting', async () => {
      prismaServiceMock.setting.findUnique.mockResolvedValue(null);
      prismaServiceMock.setting.create.mockResolvedValue(mockSetting);

      const result = await service.createSetting(mockSetting);
      expect(result).toEqual(mockSetting);
    });

    it('should throw if setting key already exists', async () => {
      prismaServiceMock.setting.findUnique.mockResolvedValue(mockSetting);

      await expect(service.createSetting(mockSetting)).rejects.toThrow(ConflictException);
    });
  });

  describe('updateSetting', () => {
    it('should update a setting', async () => {
      const updateData = { value: 'Updated Site Name' };
      const updatedSetting = { ...mockSetting, ...updateData };

      prismaServiceMock.setting.findUnique.mockResolvedValue(mockSetting);
      prismaServiceMock.setting.update.mockResolvedValue(updatedSetting);

      const result = await service.updateSetting({
        where: { key: mockSetting.key },
        data: updateData,
      });

      expect(result).toEqual(updatedSetting);
    });
  });

  describe('deleteSetting', () => {
    it('should delete a setting', async () => {
      prismaServiceMock.setting.findUnique.mockResolvedValue(mockSetting);
      prismaServiceMock.setting.delete.mockResolvedValue(mockSetting);

      const result = await service.deleteSetting({ key: mockSetting.key });
      expect(result).toEqual(mockSetting);
    });
  });
}); 