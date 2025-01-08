import { ApiError } from '@api/core/exceptions/types/error.types';
import { BadRequestException, HttpStatus } from '@nestjs/common';

export class ApiException extends BadRequestException {
  constructor(
    errors: ApiError | ApiError[],
    statusCode: number = HttpStatus.BAD_REQUEST,
  ) {
    super({ errors: Array.isArray(errors) ? errors : [errors] });
  }
}
