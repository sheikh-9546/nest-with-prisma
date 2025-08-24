import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '@api/modules/mailer/email.service';
import { SendEmailDto } from '@api/modules/mailer/dto/send-email.dto';
import * as SibApiV3Sdk from 'sib-api-v3-sdk';

// Mock the entire sib-api-v3-sdk module
jest.mock('sib-api-v3-sdk', () => ({
  ApiClient: {
    instance: {
      authentications: {
        'api-key': {
          apiKey: '',
        },
      },
    },
  },
  TransactionalEmailsApi: jest.fn().mockImplementation(() => ({
    sendTransacEmail: jest.fn(),
  })),
  SendSmtpEmail: jest.fn().mockImplementation((data) => data),
}));

describe('EmailService', () => {
  let service: EmailService;
  let configService: ConfigService;
  let mockTransactionalEmailsApi: jest.Mocked<SibApiV3Sdk.TransactionalEmailsApi>;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    // Reset the mock before each test
    mockTransactionalEmailsApi = {
      sendTransacEmail: jest.fn(),
    } as any;

    (SibApiV3Sdk.TransactionalEmailsApi as jest.Mock).mockImplementation(() => mockTransactionalEmailsApi);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('constructor', () => {
    it('should initialize Brevo SDK with configuration', () => {
      mockConfigService.get
        .mockReturnValueOnce('test-api-key')
        .mockReturnValueOnce('test@example.com')
        .mockReturnValueOnce('Test Sender');

      // Create a new instance to test constructor
      new EmailService(configService);

      expect(mockConfigService.get).toHaveBeenCalledWith('BREVO_API_KEY');
      expect(mockConfigService.get).toHaveBeenCalledWith('BREVO_SENDER_EMAIL');
      expect(mockConfigService.get).toHaveBeenCalledWith('BREVO_SENDER_NAME');
      expect(SibApiV3Sdk.TransactionalEmailsApi).toHaveBeenCalled();
    });
  });

  describe('sendEmail', () => {
    beforeEach(() => {
      mockConfigService.get
        .mockReturnValueOnce('test-api-key')
        .mockReturnValueOnce('sender@example.com')
        .mockReturnValueOnce('Test Sender');
    });

    it('should send email successfully', async () => {
      const sendEmailDto: SendEmailDto = {
        to: 'recipient@example.com',
        templateId: 1,
        params: {
          firstName: 'John',
          lastName: 'Doe',
        },
      };

      const mockResponse = {
        messageId: 'test-message-id',
      };

      mockTransactionalEmailsApi.sendTransacEmail.mockResolvedValue(mockResponse);

      const result = await service.sendEmail(sendEmailDto);

      expect(result).toEqual(mockResponse);
      expect(mockTransactionalEmailsApi.sendTransacEmail).toHaveBeenCalledWith({
        to: [{ email: 'recipient@example.com' }],
        sender: {
          email: 'sender@example.com',
          name: 'Test Sender',
        },
        templateId: 1,
        params: {
          firstName: 'John',
          lastName: 'Doe',
        },
        attachments: undefined,
      });
    });

    it('should send email with attachments', async () => {
      const sendEmailDto: SendEmailDto = {
        to: 'recipient@example.com',
        templateId: 1,
        params: {
          firstName: 'John',
        },
        attachments: [
          {
            fileName: 'document.pdf',
            content: 'base64-encoded-content',
          },
        ],
      };

      const mockResponse = {
        messageId: 'test-message-id',
      };

      mockTransactionalEmailsApi.sendTransacEmail.mockResolvedValue(mockResponse);

      const result = await service.sendEmail(sendEmailDto);

      expect(result).toEqual(mockResponse);
      expect(mockTransactionalEmailsApi.sendTransacEmail).toHaveBeenCalledWith({
        to: [{ email: 'recipient@example.com' }],
        sender: {
          email: 'sender@example.com',
          name: 'Test Sender',
        },
        templateId: 1,
        params: {
          firstName: 'John',
        },
        attachments: [
          {
            name: 'document.pdf',
            content: 'base64-encoded-content',
          },
        ],
      });
    });

    it('should handle email sending errors', async () => {
      const sendEmailDto: SendEmailDto = {
        to: 'recipient@example.com',
        templateId: 1,
        params: {
          firstName: 'John',
        },
      };

      const error = new Error('API rate limit exceeded');
      mockTransactionalEmailsApi.sendTransacEmail.mockRejectedValue(error);

      await expect(service.sendEmail(sendEmailDto)).rejects.toThrow(
        'Failed to send email: API rate limit exceeded',
      );

      expect(mockTransactionalEmailsApi.sendTransacEmail).toHaveBeenCalledWith({
        to: [{ email: 'recipient@example.com' }],
        sender: {
          email: 'sender@example.com',
          name: 'Test Sender',
        },
        templateId: 1,
        params: {
          firstName: 'John',
        },
        attachments: undefined,
      });
    });

    it('should handle empty attachments array', async () => {
      const sendEmailDto: SendEmailDto = {
        to: 'recipient@example.com',
        templateId: 1,
        params: {
          firstName: 'John',
        },
        attachments: [],
      };

      const mockResponse = {
        messageId: 'test-message-id',
      };

      mockTransactionalEmailsApi.sendTransacEmail.mockResolvedValue(mockResponse);

      const result = await service.sendEmail(sendEmailDto);

      expect(result).toEqual(mockResponse);
      expect(mockTransactionalEmailsApi.sendTransacEmail).toHaveBeenCalledWith({
        to: [{ email: 'recipient@example.com' }],
        sender: {
          email: 'sender@example.com',
          name: 'Test Sender',
        },
        templateId: 1,
        params: {
          firstName: 'John',
        },
        attachments: [],
      });
    });

    it('should handle missing params', async () => {
      const sendEmailDto: SendEmailDto = {
        to: 'recipient@example.com',
        templateId: 1,
      };

      const mockResponse = {
        messageId: 'test-message-id',
      };

      mockTransactionalEmailsApi.sendTransacEmail.mockResolvedValue(mockResponse);

      const result = await service.sendEmail(sendEmailDto);

      expect(result).toEqual(mockResponse);
      expect(mockTransactionalEmailsApi.sendTransacEmail).toHaveBeenCalledWith({
        to: [{ email: 'recipient@example.com' }],
        sender: {
          email: 'sender@example.com',
          name: 'Test Sender',
        },
        templateId: 1,
        params: undefined,
        attachments: undefined,
      });
    });
  });
});
