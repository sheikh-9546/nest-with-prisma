import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { FileUploadService } from '@api/modules/common/services/file-upload.service';
import { S3 } from 'aws-sdk';

// Mock AWS SDK
jest.mock('aws-sdk', () => ({
  S3: jest.fn().mockImplementation(() => ({
    upload: jest.fn().mockReturnValue({
      promise: jest.fn(),
    }),
  })),
}));

describe('FileUploadService', () => {
  let service: FileUploadService;
  let configService: ConfigService;
  let mockS3Instance: jest.Mocked<S3>;

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockFile: Express.Multer.File = {
    fieldname: 'file',
    originalname: 'test-image.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    buffer: Buffer.from('fake-image-data'),
    size: 1024,
    destination: '',
    filename: '',
    path: '',
    stream: null as any,
  };

  beforeEach(async () => {
    // Reset the S3 mock
    const mockUpload = jest.fn().mockReturnValue({
      promise: jest.fn(),
    });
    
    mockS3Instance = {
      upload: mockUpload,
    } as any;

    (S3 as unknown as jest.Mock).mockImplementation(() => mockS3Instance);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileUploadService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<FileUploadService>(FileUploadService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('constructor', () => {
    it('should initialize S3 with configuration', () => {
      mockConfigService.get
        .mockReturnValueOnce('test-access-key')
        .mockReturnValueOnce('test-secret-key')
        .mockReturnValueOnce('us-east-1');

      // Create a new instance to test constructor
      new FileUploadService(configService);

      expect(S3).toHaveBeenCalledWith({
        accessKeyId: 'test-access-key',
        secretAccessKey: 'test-secret-key',
        region: 'us-east-1',
      });
    });
  });

  describe('uploadFile', () => {
    beforeEach(() => {
      mockConfigService.get
        .mockReturnValueOnce('test-access-key')
        .mockReturnValueOnce('test-secret-key')
        .mockReturnValueOnce('us-east-1')
        .mockReturnValueOnce('test-bucket');
    });

    it('should upload file successfully', async () => {
      const destination = 'profiles';
      const mockUploadResult = {
        Location: 'https://test-bucket.s3.amazonaws.com/profiles/123456789-test-image.jpg',
        ETag: '"test-etag"',
        Bucket: 'test-bucket',
        Key: 'profiles/123456789-test-image.jpg',
      };

      (mockS3Instance.upload as jest.Mock).mockReturnValue({
        promise: jest.fn().mockResolvedValue(mockUploadResult),
      });

      // Mock Date.now() to get predictable key
      const mockDateNow = jest.spyOn(Date, 'now').mockReturnValue(123456789);

      const result = await service.uploadFile(mockFile, destination);

      expect(result).toBe(mockUploadResult.Location);
      expect(mockS3Instance.upload).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: 'profiles/123456789-test-image.jpg',
        Body: mockFile.buffer,
        ACL: 'public-read',
      });

      mockDateNow.mockRestore();
    });

    it('should handle upload errors', async () => {
      const destination = 'profiles';
      const error = new Error('S3 upload failed');

      (mockS3Instance.upload as jest.Mock).mockReturnValue({
        promise: jest.fn().mockRejectedValue(error),
      });

      await expect(service.uploadFile(mockFile, destination)).rejects.toThrow(error);

      expect(mockS3Instance.upload).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: expect.stringContaining('profiles/'),
        Body: mockFile.buffer,
        ACL: 'public-read',
      });
    });

    it('should generate unique file keys with timestamp', async () => {
      const destination = 'documents';
      const mockUploadResult = {
        Location: 'https://test-bucket.s3.amazonaws.com/documents/987654321-test-image.jpg',
      };

      (mockS3Instance.upload as jest.Mock).mockReturnValue({
        promise: jest.fn().mockResolvedValue(mockUploadResult),
      });

      // Mock Date.now() to get predictable key
      const mockDateNow = jest.spyOn(Date, 'now').mockReturnValue(987654321);

      await service.uploadFile(mockFile, destination);

      expect(mockS3Instance.upload).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: 'documents/987654321-test-image.jpg',
        Body: mockFile.buffer,
        ACL: 'public-read',
      });

      mockDateNow.mockRestore();
    });

    it('should handle different file types', async () => {
      const destination = 'uploads';
      const pdfFile: Express.Multer.File = {
        ...mockFile,
        originalname: 'document.pdf',
        mimetype: 'application/pdf',
        buffer: Buffer.from('fake-pdf-data'),
      };

      const mockUploadResult = {
        Location: 'https://test-bucket.s3.amazonaws.com/uploads/123456789-document.pdf',
      };

      (mockS3Instance.upload as jest.Mock).mockReturnValue({
        promise: jest.fn().mockResolvedValue(mockUploadResult),
      });

      const mockDateNow = jest.spyOn(Date, 'now').mockReturnValue(123456789);

      const result = await service.uploadFile(pdfFile, destination);

      expect(result).toBe(mockUploadResult.Location);
      expect(mockS3Instance.upload).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: 'uploads/123456789-document.pdf',
        Body: pdfFile.buffer,
        ACL: 'public-read',
      });

      mockDateNow.mockRestore();
    });

    it('should handle files with special characters in name', async () => {
      const destination = 'uploads';
      const specialFile: Express.Multer.File = {
        ...mockFile,
        originalname: 'test file with spaces & symbols!.jpg',
      };

      const mockUploadResult = {
        Location: 'https://test-bucket.s3.amazonaws.com/uploads/123456789-test file with spaces & symbols!.jpg',
      };

      (mockS3Instance.upload as jest.Mock).mockReturnValue({
        promise: jest.fn().mockResolvedValue(mockUploadResult),
      });

      const mockDateNow = jest.spyOn(Date, 'now').mockReturnValue(123456789);

      await service.uploadFile(specialFile, destination);

      expect(mockS3Instance.upload).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: 'uploads/123456789-test file with spaces & symbols!.jpg',
        Body: specialFile.buffer,
        ACL: 'public-read',
      });

      mockDateNow.mockRestore();
    });
  });
});