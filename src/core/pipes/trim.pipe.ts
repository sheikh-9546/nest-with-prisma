import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { isObject } from 'lodash';

/**
 * A pipe to trim whitespace from string properties of an object.
 * This pipe is applied to the request body, excluding properties listed in the blacklist.
 */
@Injectable()
export class TrimPipe implements PipeTransform {
  private readonly blacklist: Set<string> = new Set([
    'password',
    'confirm_password',
  ]);

  /**
   * Transforms the value by trimming whitespace from string properties.
   *
   * @param value - The value to be transformed.
   * @param metadata - Metadata about the value.
   * @returns The transformed value with trimmed string properties.
   */
  transform(value: any, metadata: ArgumentMetadata): any {
    const { type } = metadata;
    if (type === 'body' && isObject(value)) {
      return this.trim(value);
    }

    return value;
  }

  /**
   * Recursively trims whitespace from string properties of an object.
   *
   * @param values - The object containing properties to be trimmed.
   * @returns The object with trimmed string properties.
   */
  private trim(values: any): any {
    const stack = [values];
    while (stack.length) {
      const current = stack.pop();
      Object.entries(current).forEach(([key, value]) => {
        if (!this.blacklist.has(key)) {
          if (typeof value === 'string') {
            current[key] = value.trim();
          } else if (isObject(value)) {
            stack.push(value);
          }
        }
      });
    }
    return values;
  }
}
