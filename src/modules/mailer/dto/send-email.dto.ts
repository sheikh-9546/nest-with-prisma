import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsObject, IsArray } from 'class-validator';

export class SendEmailDto {
  @IsEmail()
  @IsNotEmpty()
  to: string;

  @IsInt()
  @IsNotEmpty()
  templateId: number; 

  @IsObject()
  @IsOptional()
  params?: Record<string, any>; 

  @IsArray()
  @IsOptional()
  attachments?: Array<{
    fileName: string;
    content: string; 
  }>; 
}
