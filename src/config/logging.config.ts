import * as process from 'process';

export type LoggingConfig = {
  level: string;
};

export const getLoggingConfig = (): LoggingConfig => ({
  level: process.env.LOG_LEVEL || 'info',
});
