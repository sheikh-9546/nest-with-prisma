import { AppConfig } from '@api/config/app.config';
import { SwaggerCustomOptions } from '@nestjs/swagger';

export const getSwaggerConfig = (
  appConfig: AppConfig,
): SwaggerCustomOptions => ({
  customSiteTitle: `${appConfig.name} | API Documentation`,
  customCss: `.opblock-summary-operation-id { word-break: normal !important; }`,
  swaggerOptions: {
    displayOperationId: true,
    persistAuthorization: true,
    disableSwaggerDefaultUrl: true,
    defaultModelsExpandDepth: false,
  },
});
