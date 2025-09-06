import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Messages } from '@api/constants/messages';
import { ErrorCodes } from '@api/core/exceptions/error.codes';

interface AuthErrorResponse {
  statusCode: number;
  error: string;
  message: string;
  code: string;
  timestamp: string;
  path: string;
  details?: {
    reason: string;
    suggestion: string;
  };
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    
    // If there's an error or no user, throw a detailed unauthorized exception
    if (err || !user) {
      const errorResponse = this.createDetailedErrorResponse(authHeader, info, request.url);
      throw new UnauthorizedException(errorResponse);
    }
    
    return user;
  }

  private createDetailedErrorResponse(authHeader: string, info: any, path: string): AuthErrorResponse {
    let message: string;
    let details: { reason: string; suggestion: string };
    let code: string;

    // Determine the specific authentication issue
    if (!authHeader) {
      message = Messages.Auth.Error.TOKEN_MISSING;
      details = Messages.Auth.ErrorDetails.TOKEN_MISSING;
      code = ErrorCodes.TOKEN_MISSING;
    } else if (!authHeader.startsWith('Bearer ')) {
      message = Messages.Auth.Error.TOKEN_MALFORMED;
      details = Messages.Auth.ErrorDetails.TOKEN_MALFORMED;
      code = ErrorCodes.TOKEN_MALFORMED;
    } else if (info?.name === 'TokenExpiredError') {
      message = Messages.Auth.Error.TOKEN_EXPIRED;
      details = Messages.Auth.ErrorDetails.TOKEN_EXPIRED;
      code = ErrorCodes.TOKEN_EXPIRED;
    } else if (info?.name === 'JsonWebTokenError') {
      message = Messages.Auth.Error.TOKEN_SIGNATURE_INVALID;
      details = Messages.Auth.ErrorDetails.TOKEN_SIGNATURE_INVALID;
      code = ErrorCodes.TOKEN_INVALID;
    } else if (info?.name === 'NotBeforeError') {
      message = Messages.Auth.Error.TOKEN_NOT_ACTIVE;
      details = Messages.Auth.ErrorDetails.TOKEN_NOT_ACTIVE;
      code = ErrorCodes.TOKEN_INVALID;
    } else {
      message = Messages.Auth.Error.TOKEN_VALIDATION_FAILED;
      details = Messages.Auth.ErrorDetails.TOKEN_VALIDATION_FAILED;
      code = ErrorCodes.ACCESS_DENIED;
    }

    return {
      statusCode: 401,
      error: 'Unauthorized',
      message,
      code,
      timestamp: new Date().toISOString(),
      path,
      details
    };
  }
}

