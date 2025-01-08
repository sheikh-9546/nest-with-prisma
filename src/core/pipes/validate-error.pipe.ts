import { ValidationErrorException } from '@api/core/exceptions/validation-error.exception';
import SharedUtils from '@api/shared/shared.utils';
import { HttpStatus, Injectable, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';

@Injectable()
export class ValidateErrorPipe {
  static build(): ValidationPipe {
    return new ValidationPipe({
      whitelist: true,
      transform: true,
      stopAtFirstError: false,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      exceptionFactory: (constraintError: ValidationError[]): void => {
        throw new ValidationErrorException(
          SharedUtils.formatValidationError(constraintError),
        );
      },
    });
  }
}
