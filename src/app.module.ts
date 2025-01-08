import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ResponseInterceptor } from '@api/core/interceptors/response.interceptor';
import { TrimPipe } from '@api/core/pipes/trim.pipe';
import { ValidateErrorPipe } from '@api/core/pipes/validate-error.pipe';
import { LoggingConfig } from './config/logging.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DomainsModule } from './modules/domains.module';
import { PrismaModule } from './database/prisma.module';
import { Configuration } from './config';
import { LoggerModule } from 'nestjs-pino';
import { ErrorHandlerFilter } from './core/error-handler.filter';
import { AuditModule } from './modules/audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [Configuration],
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory(configService: ConfigService): any {
        const logConfig: LoggingConfig =
          configService.get<LoggingConfig>('logging');
        return {
          logLevel: logConfig.level,
        };
      },
    }),
    PrismaModule,
    DomainsModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_PIPE, useClass: TrimPipe },
    { provide: APP_PIPE, useValue: ValidateErrorPipe.build() },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    // { provide: APP_FILTER, useClass: ErrorHandlerFilter },
  ],
})
export class AppModule {}
