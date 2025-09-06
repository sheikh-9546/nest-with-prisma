import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';

/**
 * Decorator to add field metadata for better error handling
 */
export function FieldError(fieldName: string, errorCode?: string) {
  return applyDecorators(
    Transform(({ value }) => value, {
      toClassOnly: true,
    }),
    // Store metadata for error handling
    Reflect.metadata('fieldName', fieldName),
    Reflect.metadata('errorCode', errorCode),
  );
}

/**
 * Get field metadata from class property
 */
export function getFieldMetadata(target: any, propertyKey: string) {
  return {
    fieldName: Reflect.getMetadata('fieldName', target, propertyKey) || propertyKey,
    errorCode: Reflect.getMetadata('errorCode', target, propertyKey),
  };
}
