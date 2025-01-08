import { AppConfig, getAppConfig } from '@api/config/app.config';
import { DatabaseConfig, getDatabaseConfig } from '@api/config/database.config';
import { getLoggingConfig, LoggingConfig } from '@api/config/logging.config';
import { getSwaggerConfig } from '@api/config/swagger.config';
import { SwaggerCustomOptions } from '@nestjs/swagger';
// import { HelmetOptions } from 'helmet';

export type AppConfiguration = {
  app: AppConfig;
  logging: LoggingConfig;
  database: DatabaseConfig;
  // redis: RedisConfig;
  // jwt: JwtConfig;
  // httpBasic: HttpBasicConfig;
  // kafka: KafkaConfig;
  // elasticsearch: ElasticsearchConfig;
  // helmetConfig: HelmetOptions;
  // attachment: AttachmentConfig;
  swagger: SwaggerCustomOptions;
};

/**
 * Retrieves the full application configuration.
 * @returns {AppConfiguration} - The complete application configuration.
 */
export const Configuration = (): AppConfiguration => {
  const appConfig = getAppConfig();
  return {
    app: appConfig,
    logging: getLoggingConfig(),
    database: getDatabaseConfig(),
    swagger: getSwaggerConfig(appConfig),
  };
};

/**
 * Checks if the current environment is production.
 * @returns {boolean} - True if the current environment is production, false otherwise.
 */
export const isProdEnv = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

/**
 * Checks if the current environment is development.
 * @returns {boolean} - True if the current environment is development, false otherwise.
 */
export const isDevEnv = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

/**
 * Checks if the current environment is integration test.
 * @returns {boolean} - True if the current environment is integration test, false otherwise.
 */
export const isTestEnv = (): boolean => {
  return process.env.NODE_ENV === 'test';
};
