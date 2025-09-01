// src/constants/messages.ts

export const Messages = {
    Auth: {
        Validation: {
          EMAIL_REQUIRED: 'Email is required',
          EMAIL_INVALID: 'Invalid email format',
          PASSWORD_REQUIRED: 'Password is required',
          PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters',
          TOKEN_REQUIRED: 'Reset token is required',
        },
        Error: {
          USER_NOT_FOUND: 'User not found',
          INVALID_CREDENTIALS: 'Invalid credentials provided',
          REFRESH_TOKEN_INVALID: 'Invalid refresh token',
          TOKEN_INVALID: 'Token is invalid or expired token',
          UNAUTHORIZED: 'Unauthorized access',
          PASSWORDS_DO_NOT_MATCH: 'Passwords do not match',
          USER_ACCOUNT_IS_NOT_ACTIVE: 'User account is not active',
        },
        Success: {
          PASSWORD_RESET_SUCCESS: 'Password has been successfully reset',
          EMAIL_SENT_SUCCESS: 'Password reset link has been sent to your email',
          LOGIN_SUCCESS: 'Login successful',
          USER_CREATED_SUCCESS: 'User account created successfully',
          USER_UPDATED_SUCCESS: 'User account updated successfully',
          USER_DELETED_SUCCESS: 'User account deleted successfully',
        },
      },
    User: {
      Validation: {
        EMAIL_REQUIRED: 'Email is required',
        EMAIL_INVALID: 'Invalid email format',
        PASSWORD_REQUIRED: 'Password is required',
        PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters long',
        TOKEN_REQUIRED: 'Reset token is required',
      },
      Error: {
        USER_NOT_FOUND: 'User not found',
        INVALID_CREDENTIALS: 'Invalid credentials provided',
        TOKEN_INVALID: 'Invalid or expired token',
        UNAUTHORIZED: 'Unauthorized access',
        PASSWORDS_DO_NOT_MATCH: 'Passwords do not match',
        CURRENT_PASSWORDS_DO_NOT_MATCH: 'Current passwords do not match',
        USER_ACCOUNT_IS_NOT_ACTIVE: 'User account is not active',
        EMAIL_ALREADY_EXISTS: (email: string) => `Email ${email} already exists.`,
        PHONE_NUMBER_ALREADY_EXISTS: (phoneNumber: string) => `Phone Number ${phoneNumber} already exists.`,
      },
      Success: {
        PASSWORD_RESET_SUCCESS: 'Password has been successfully reset',
        EMAIL_SENT_SUCCESS: 'Password reset link has been sent to your email',
        LOGIN_SUCCESS: 'Login successful',
        USER_CREATED_SUCCESS: 'User account created successfully',
        USER_UPDATED_SUCCESS: 'User account updated successfully',
        USER_DELETED_SUCCESS: 'User account deleted successfully',
      },
    },
    Role: {
      Validation: {
        ROLE_NAME_REQUIRED: 'Role name is required',
      },
      Error: {
        IS_ROLE_NOT_FOUND: (roleId: Number) => `Role ${roleId} not found.`,
        ROLE_NOT_FOUND: `Role not found.`,
        DUPLICATE_ROLE: 'A role with this name already exists',
      },
      Success: {
        ROLE_CREATED_SUCCESS: 'Role has been created successfully',
        ROLE_UPDATED_SUCCESS: 'Role has been updated successfully',
        ROLE_DELETED_SUCCESS: 'Role has been deleted successfully',
      },
    },
    Settings: {
      Error: {
        SETTING_NOT_FOUND: 'Setting not found',
        SETTING_KEY_EXISTS: (key: string) => `Setting with key "${key}" already exists`,
      },
      Success: {
        SETTING_CREATED: 'Setting created successfully',
        SETTING_UPDATED: 'Setting updated successfully',
        SETTING_DELETED: 'Setting deleted successfully',
      },
    },
  };
  