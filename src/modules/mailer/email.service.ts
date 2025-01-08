import { Injectable } from '@nestjs/common';
import * as SibApiV3Sdk from 'sib-api-v3-sdk';
import { ConfigService } from '@nestjs/config';
import { SendEmailDto } from './dto/send-email.dto';

@Injectable()
export class EmailService {
    private brevoApiInstance: SibApiV3Sdk.TransactionalEmailsApi;
    private sender: SibApiV3Sdk.SendSmtpEmailSender;

    constructor(private readonly configService: ConfigService) {
        // Initialize Brevo SDK with API key
        const brevoApiKey = this.configService.get<string>('BREVO_API_KEY');
        const defaultClient = SibApiV3Sdk.ApiClient.instance;
        const apiKey = defaultClient.authentications['api-key'];
        apiKey.apiKey = brevoApiKey;

        this.brevoApiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
        this.sender = {
            email: this.configService.get<string>('BREVO_SENDER_EMAIL'),
            name: this.configService.get<string>('BREVO_SENDER_NAME'),
        };
    }

    async sendEmail(sendEmailDto: SendEmailDto): Promise<any> {
        const { to, templateId, params,attachments } = sendEmailDto;

        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail({
          to: [{ email: to }],
          sender: this.sender,
          templateId,  // Use the template ID instead of htmlContent
          params,      // Dynamic parameters for the template
          attachments: attachments?.map(attachment => ({
            name: attachment.fileName,
            content: attachment.content,
          })), // Attachments in base64
        });

        try {
            const response = await this.brevoApiInstance.sendTransacEmail(sendSmtpEmail);
            return response;
        } catch (error) {
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }
}
