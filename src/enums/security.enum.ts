export enum SecurityConstants {
  BCRYPT_SALT_ROUNDS = 10,
  TOKEN_EXPIRY_MS = 3600000, // 1 hour in milliseconds
  DEFAULT_JWT_EXPIRES_IN = '3600s', // 1 hour in seconds
}

export enum DefaultRoles {
  ADMIN_ROLE_ID = 1,
  USER_ROLE_ID = 2,
  MODERATOR_ROLE_ID = 3,
}

export const UserDefaults = {
  EMPTY_STRING: '',
  IS_VERIFIED: true,
  IS_NOT_VERIFIED: false,
} as const;
