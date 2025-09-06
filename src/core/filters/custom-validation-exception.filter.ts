import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(BadRequestException)
export class CustomValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;

    // Check if this is our custom validation error
    if (
      exceptionResponse &&
      typeof exceptionResponse === 'object' &&
      exceptionResponse.details &&
      Array.isArray(exceptionResponse.details)
    ) {
      // This is our custom validation error, just add the path
      const errorResponse = {
        ...exceptionResponse,
        path: request.url,
      };

      response.status(status).json(errorResponse);
    } else {
      // For other BadRequestExceptions, use default format
      const errorResponse = {
        statusCode: status,
        error: 'Bad Request',
        message: exceptionResponse.message || exception.message,
        timestamp: new Date().toISOString(),
        path: request.url,
      };

      response.status(status).json(errorResponse);
    }
  }
}
