import * as process from 'process';

export type AppConfig = {
  tz: string;
  env: string;
  name: string;
  port: string;
  apiKeys: string;
};

export const getAppConfig = (): AppConfig => ({
  tz: process.env.APP_TZ || 'UTC',
  env: process.env.NODE_ENV || 'development',
  name: process.env.APP_NAME || 'MyApp',
  port: process.env.APP_PORT || '3000',
  apiKeys: process.env.APP_API_KEYS || '',
});
