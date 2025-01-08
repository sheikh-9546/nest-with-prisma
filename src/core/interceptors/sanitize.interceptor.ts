import { SanitizationCondition } from '@api/core/interceptors/types/interceptor.types';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class SanitizeInterceptor implements NestInterceptor {
  private sanitizationConditions: SanitizationCondition[] = [
    (value: any) => value === null || value === undefined,
  ];

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(map((responseData) => this.sanitizeResponseData(responseData)));
  }

  /**
   * Add a new condition to sanitize values.
   * @param condition - A function that returns true if the value should be sanitized.
   */
  addSanitizationCondition(condition: SanitizationCondition): void {
    this.sanitizationConditions.push(condition);
  }

  /**
   * Sanitize the response data by removing values that meet sanitization conditions.
   * @param data - The data to be sanitized.
   * @returns The sanitized data.
   */
  private sanitizeResponseData(data: any): any {
    if (this.shouldSanitize(data)) {
      return undefined;
    }
    if (Array.isArray(data)) {
      return this.sanitizeArray(data);
    } else if (
      typeof data === 'object' &&
      data !== null &&
      !this.isDate(data)
    ) {
      return this.sanitizeObject(data);
    }
    return data;
  }

  /**
   * Sanitize an array by removing values that meet sanitization conditions.
   * @param array - The array to be sanitized.
   * @returns The sanitized array.
   */
  private sanitizeArray(array: any[]): any[] {
    return array
      .map((item) => this.sanitizeResponseData(item))
      .filter((item) => !this.shouldSanitize(item));
  }

  /**
   * Sanitize an object by removing properties with values that meet sanitization conditions and sorting keys alphabetically if needed.
   * @param obj - The object to be sanitized.
   * @returns The sanitized and sorted object.
   */
  private sanitizeObject(obj: Record<string, any>): Record<string, any> {
    return Object.keys(obj).reduce((accumulator, key) => {
      const sanitizedValue = this.sanitizeResponseData(obj[key]);
      if (!this.shouldSanitize(sanitizedValue)) {
        accumulator[key] = sanitizedValue;
      }
      return accumulator;
    }, {});
  }

  /**
   * Check if a value should be sanitized based on the registered conditions.
   * @param value - The value to check.
   * @returns True if the value should be sanitized, otherwise false.
   */
  private shouldSanitize(value: any): boolean {
    return this.sanitizationConditions.some((condition) => condition(value));
  }

  /**
   * Check if a value is a Date object.
   * @param value - The value to check.
   * @returns True if the value is a Date object, otherwise false.
   */
  private isDate(value: any): boolean {
    return (
      value instanceof Date ||
      (typeof value === 'string' && !isNaN(Date.parse(value)))
    );
  }
}
