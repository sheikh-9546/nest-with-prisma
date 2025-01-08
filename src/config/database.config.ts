import * as process from 'process';

export type DatabaseConfig = {
  masterUrl: string;
};

export const getDatabaseConfig = (): DatabaseConfig => ({
  masterUrl: process.env.DATABASE_URL || '',
});
