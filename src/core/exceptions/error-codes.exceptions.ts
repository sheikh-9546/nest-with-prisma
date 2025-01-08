export const ErrorCodes = {
  /**
   * -------------------------------------------------------------
   * General Errors (G3000-G3099)
   * --------------------------------------------------------------
   */
  CONFIGURATION_MISSING: 'G3000', // Required configuration is missing
  SERVICE_GENERAL_ERROR: 'G3001', // General unspecified error
  INTERNAL_SERVER_ERROR: 'G3002', // Internal server error

  /**
   * -------------------------------------------------------------
   * Authentication and Authorization Errors (A1000-A1099)
   * --------------------------------------------------------------
   */
  ACCESS_DENIED: 'A1000', // Access is denied
  ACCOUNT_LOCKED: 'A1001', // Account is locked
  INVALID_CREDENTIALS: 'A1002', // Invalid username or password
  TOKEN_EXPIRED: 'A1003', // Authentication token has expired

  /**
   * -------------------------------------------------------------
   * Validation Errors (V2000-V2099)
   * --------------------------------------------------------------
   */
  DATA_OUT_OF_RANGE: 'V2000', // Data is out of the allowed range
  DUPLICATE_ENTRY: 'V2001', // Duplicate entry found
  FOREIGN_KEY_CONSTRAINT: 'V2002', // Foreign key constraint violation
  INVALID_INPUT_FORMAT: 'V2003', // Input format is invalid
  INVALID_MODEL: 'V2004', // Model validation failed
  MISSING_REQUIRED_FIELDS: 'V2005', // Missing required fields in the input

  /**
   * -------------------------------------------------------------
   * Resource Errors (R4000-R4099)
   * --------------------------------------------------------------
   */
  RESOURCE_CONFLICT: 'R4000', // Conflict with the current state of the resource
  RESOURCE_NOT_FOUND: 'R4001', // Requested resource not found
  RESOURCE_UNAVAILABLE: 'R4002', // Resource is unavailable

  /**
   * -------------------------------------------------------------
   * Business Logic Errors (B5000-B5099)
   * --------------------------------------------------------------
   */
  BUSINESS_RULE_VIOLATION: 'B5000', // Violation of business logic rules
  OPERATION_NOT_PERMITTED: 'B5001', // Operation is not permitted
  QUOTA_EXCEEDED: 'B5002', // Quota has been exceeded

  /**
   * -------------------------------------------------------------
   * External Service Errors (E6000-E6099)
   * --------------------------------------------------------------
   */
  DATABASE_ERROR: 'E6000', // Database error occurred
  EXTERNAL_SERVICE_ERROR: 'E6001', // Error from an external service
} as const;

export type ErrorCodes = (typeof ErrorCodes)[keyof typeof ErrorCodes];
