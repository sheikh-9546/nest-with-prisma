import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { CustomValidationPipe } from './core/pipes/custom-validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure class-validator to use NestJS dependency injection container
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // Use custom validation pipe for better error formatting
  app.useGlobalPipes(new CustomValidationPipe());

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('User Module API Documentation')
    .setDescription('User Module API Documentation')
    .setVersion('1.0')
    .addBearerAuth() 
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(3000);
}
bootstrap();
