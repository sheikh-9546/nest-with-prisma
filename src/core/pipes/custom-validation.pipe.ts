import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

interface ValidationErrorDetail {
  field: string;
  message: string;
  code: string;
  value?: any;
}

@Injectable()
export class CustomValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const details: ValidationErrorDetail[] = [];

      errors.forEach((error) => {
        if (error.constraints) {
          Object.values(error.constraints).forEach((message) => {
            details.push({
              field: error.property,
              message: message,
              code: this.extractErrorCode(message),
              value: error.value,
            });
          });
        }
      });

      // Create the custom error response structure
      const errorResponse = {
        statusCode: 400,
        error: 'Validation Failed',
        message: 'The request contains invalid data',
        timestamp: new Date().toISOString(),
        details,
      };

      // Throw BadRequestException with our custom structure
      throw new BadRequestException(errorResponse);
    }

    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private extractErrorCode(message: string): string {
    // Custom validators (database checks)
    if (message.includes('already in use') || message.includes('already exists')) {
      if (message.includes('Email')) return 'EMAIL_ALREADY_EXISTS';
      if (message.includes('Phone')) return 'PHONE_ALREADY_EXISTS';
    }
    if (message.includes('does not exist') || message.includes('not found')) {
      return 'RESOURCE_NOT_FOUND';
    }

    // Standard validation errors
    if (message.includes('is required') || message.includes('should not be empty')) return 'FIELD_REQUIRED';
    if (message.includes('Invalid email') || message.includes('must be an email')) return 'INVALID_EMAIL_FORMAT';
    if (message.includes('must be an integer') || message.includes('must be a number')) return 'INVALID_NUMBER_FORMAT';
    if (message.includes('must be a string')) return 'INVALID_STRING_FORMAT';
    if (message.includes('must be at least') && message.includes('characters long')) return 'MIN_LENGTH_VIOLATION';
    if (message.includes('cannot exceed') && message.includes('characters')) return 'MAX_LENGTH_VIOLATION';
    if (message.includes('must contain at least one')) return 'PASSWORD_COMPLEXITY_VIOLATION';
    if (message.includes('must contain only numeric digits')) return 'INVALID_PHONE_FORMAT';
    if (message.includes('must be in format') || message.includes('must be') && message.includes('digits')) return 'INVALID_FORMAT';
    if (message.includes('invalid') || message.includes('Invalid')) return 'INVALID_FORMAT';
    
    return 'VALIDATION_ERROR';
  }
}
