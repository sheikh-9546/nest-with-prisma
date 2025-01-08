import { ApiException } from '@api/core/exceptions/api.exception';
import { ApiError } from '@api/core/exceptions/types/error.types';
import { HttpStatus } from '@nestjs/common';

export class ValidationErrorException extends ApiException {
  constructor(errors: ApiError[]) {
    super(errors, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}
