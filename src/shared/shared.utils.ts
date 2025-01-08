import { ValidationError } from 'class-validator';
import { createHash } from 'crypto';
import { isEmpty } from 'lodash';
import { ApiError } from 'src/core/exceptions/types/error.types';
import { v4 as uuid4 } from 'uuid';

class SharedUtils {
  /**
   * Checks if the given array of values is not empty.
   * @param values - The array of values to check.
   * @returns - True if the array is not empty, false otherwise.
   */
  static notEmpty(values: any[]): boolean {
    return !isEmpty(values);
  }

  /**
   * Converts a time string with units to seconds.
   *
   * @param timeString - The time string to convert (e.g., "1m", "2h", "3d").
   * @returns The equivalent value in seconds.
   * @throws Error if the input format is invalid or the unit is not recognized.
   */
  static convertTimeToSeconds(timeString: string): number {
    if (!/^\d+[smhd]$/.test(timeString)) {
      throw new Error(`Invalid time format: ${timeString}`);
    }

    const timeValue = parseInt(timeString.slice(0, -1), 10);
    const timeUnit = timeString.slice(-1);

    switch (timeUnit) {
      case 's':
        return timeValue;
      case 'm':
        return timeValue * 60;
      case 'h':
        return timeValue * 60 * 60;
      case 'd':
        return timeValue * 60 * 60 * 24;
      default:
        throw new Error(`Invalid time unit: ${timeUnit}`);
    }
  }

  /**
   * Capitalizes the first character of a string.
   * @param str - The input string.
   * @returns - The modified string with the first character capitalized.
   */
  static toUppercaseFirst(str: string): string | null {
    if (str && str.trim().length > 0) {
      const trimString = str.trim();
      return `${trimString[0].toUpperCase()}${trimString.substring(1)}`;
    }
    return null;
  }

  /**
   * Splits a tag string into an array of strings.
   * @param tag - The input tag string.
   * @returns - An array of strings or null if the input is falsy.
   */
  static toSplit(tag: string): string[] | null {
    if (!tag) {
      return null;
    }

    return tag
      .split(',')
      .map((st) => st.trim())
      .filter((value) => value !== '');
  }

  /**
   * Formats validation errors into a more user-friendly list of field errors.
   * This function is designed to handle nested validation errors by recursively processing each error.
   * Each error in the provided array is processed to extract the last constraint message associated with the field.
   *
   * @param {ValidationError[]} errors - Array of ValidationError objects typically provided by a validation library like class-validator.
   * @returns {ApiError[]} An array of ApiErrorModel objects that represent user-friendly field errors.
   * Each ApiErrorModel includes the field name and a message detailing the issue with that field.
   *
   * @example
   * // Assuming `validate` is a function from class-validator that validates an object and returns a promise of ValidationError array.
   * validate(someObject).then(errors => {
   *   if (errors.length > 0) {
   *     const formattedErrors = Utils.formatValidationError(errors);
   *     console.log(formattedErrors);
   *   }
   * });
   */
  static formatValidationError(errors: ValidationError[]): ApiError[] {
    const errorMessages: ApiError[] = [];

    function formatError(fieldErrors?: ValidationError[]): void {
      fieldErrors?.map((error: ValidationError) => {
        const constraints = error.constraints
          ? Object.values(error.constraints).pop()
          : undefined;
        if (constraints) {
          errorMessages.push({
            fieldName: error.property,
            message: constraints,
          });
        }

        return formatError(error.children);
      });
    }
    formatError(errors);
    return errorMessages;
  }

  /**
   * Generates a unique chat handle based on the user's name and account ID.
   * @param name - The name of the user.
   * @param accountId - The account ID to ensure uniqueness within an account.
   * @returns The generated chat handle.
   */
  static generateChatHandle(name: string, accountId: string): string {
    const uuid = uuid4().slice(0, 4);
    const hash = createHash('md5')
      .update(name + accountId)
      .digest('hex')
      .slice(0, 2);
    return `${name}${hash}${uuid}`.toLowerCase().replace(/[\s-]/g, '');
  }

  /**
   * Validates if a given string is a valid ObjectId.
   *
   * @param id - The string to validate.
   * @returns True if the string is a valid ObjectId, false otherwise.
   */
  static isValidObjectId(id: string): boolean {
    return /^[a-fA-F0-9]{24}$/.test(id);
  }
}
export default SharedUtils;
