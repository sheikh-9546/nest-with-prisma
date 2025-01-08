import { ErrorCodes } from '../error-codes.exceptions';

export type ApiError = {
  errorCode?: ErrorCodes;
  fieldName?: string;
  message: string;
};
