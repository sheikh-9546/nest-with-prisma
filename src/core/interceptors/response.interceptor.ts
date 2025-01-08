import { SuccessResponse } from '@api/shared/types/shared.types';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, SuccessResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<SuccessResponse<T>> {
    const response: any = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data) => ({
        status: response.statusCode,
        message: 'success',
        responseTimeStamp: Date.now(),
        result: data || null,
      })),
    );
  }
}
