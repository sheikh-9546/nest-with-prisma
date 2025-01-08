import { HttpException, HttpStatus } from '@nestjs/common';

export class ErrorHandler {
  static userNotFoundError(message: string, status: HttpStatus) {
    throw new HttpException(
      {
        status: status,
        error: message,
      },
      status,
    );
  }
}
