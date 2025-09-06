import { UnauthorizedException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { Messages } from '@api/constants/messages';

/**
 * Decorator for consistent error handling across service methods
 */
export function HandleErrors(options?: {
  defaultMessage?: string;
  mapErrors?: Record<string, any>;
}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await method.apply(this, args);
      } catch (error) {
        // Handle JWT errors
        if (error.name === 'TokenExpiredError') {
          throw new UnauthorizedException(Messages.Auth.Error.TOKEN_EXPIRED);
        }
        if (error.name === 'JsonWebTokenError') {
          throw new UnauthorizedException(Messages.Auth.Error.TOKEN_INVALID);
        }
        if (error.name === 'NotBeforeError') {
          throw new UnauthorizedException(Messages.Auth.Error.TOKEN_NOT_ACTIVE);
        }

        // Handle Prisma errors
        if (error.code === 'P2025') { // Record not found
          throw new BadRequestException(Messages.Auth.Error.USER_NOT_FOUND);
        }
        if (error.code === 'P2002') { // Unique constraint violation
          throw new BadRequestException('Duplicate entry found');
        }

        // Handle custom error mappings
        if (options?.mapErrors && error.code && options.mapErrors[error.code]) {
          throw new BadRequestException(options.mapErrors[error.code]);
        }

        // Re-throw if it's already a NestJS exception
        if (error instanceof UnauthorizedException || 
            error instanceof BadRequestException || 
            error instanceof InternalServerErrorException) {
          throw error;
        }

        // Generic fallback
        const defaultMessage = options?.defaultMessage || 'An error occurred';
        throw new InternalServerErrorException(defaultMessage);
      }
    };

    return descriptor;
  };
}

/**
 * Specific decorator for authentication-related methods
 */
export function HandleAuthErrors(defaultMessage?: string) {
  return HandleErrors({
    defaultMessage: defaultMessage || Messages.Auth.Error.TOKEN_INVALID,
    mapErrors: {
      'P2025': Messages.Auth.Error.USER_NOT_FOUND,
      'INVALID_CREDENTIALS': Messages.Auth.Error.INVALID_CREDENTIALS,
    }
  });
}
