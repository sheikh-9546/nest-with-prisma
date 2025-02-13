import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileUploadService {
  private s3: S3;

  constructor(private configService: ConfigService) {
    this.s3 = new S3({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get('AWS_REGION'),
    });
  }

  async uploadFile(file: Express.Multer.File, destination: string): Promise<string> {
    const params = {
      Bucket: this.configService.get('AWS_S3_BUCKET_NAME'),
      Key: `${destination}/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ACL: 'public-read',
    };

    const uploadResult = await this.s3.upload(params).promise();
    return uploadResult.Location;
  }
} 