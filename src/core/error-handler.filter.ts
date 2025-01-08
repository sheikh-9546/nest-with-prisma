import { ApiException } from '@api/core/exceptions/api.exception';
import { ErrorCodes } from '@api/core/exceptions/error.codes';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  LoggerService,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Response } from 'express';

@Catch()
export class ErrorHandlerFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  /**
   * Catches exceptions and formats the error response.
   * @param exception - The caught exception.
   * @param host - The arguments host containing context.
   */
  catch(exception: any, host: ArgumentsHost): void {
    const status = this.getHttpStatus(exception);
    const errorResponse = {
      errors: this.formatErrorDetails(exception),
    };

    this.render(exception, status);
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(status)
      .json(errorResponse);
  }

  /**
   * Logs the error message based on the HTTP status.
   * @param exception - The caught exception.
   * @param status - The HTTP status code.
   */
  private render(exception: any, status: any): void {
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      exception instanceof Error
        ? this.logger.error(`${exception.message}`)
        : this.logger.error(`Error: ${exception.message}`);
    } else {
      this.logger.error(exception.message);
    }
  }

  /**
   * Determines the appropriate HTTP status code for the exception.
   * @param exception - The caught exception.
   * @returns The HTTP status code.
   */
  private getHttpStatus(exception: any): number {
    return exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
  }

  /**
   * Extracts detailed error information from the exception.
   *
   * @param exception - The caught exception.
   * @returns An array of error details.
   */
  private formatErrorDetails(exception: any): any[] {
    if (exception instanceof PrismaClientKnownRequestError) {
      return [
        {
          errorCode: ErrorCodes.DATABASE_ERROR,
          message:
            'An unexpected database error occurred. Please try again later.',
        },
      ];
    }

    if (exception instanceof ApiException) {
      return (exception.getResponse() as any)?.errors;
    }

    return [
      {
        errorCode: ErrorCodes.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error occurred. Please try again later.',
      },
    ];
  }
}
