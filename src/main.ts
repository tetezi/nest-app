import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      // exceptionFactory: (errors: ValidationError[]) => {
      //   const errorMessages = errors.map((error) => {
      //     return {
      //       property: error.property,
      //       constraints: error.constraints,
      //     };
      //   });
      //   return new BadRequestException(errorMessages);
      // },
    }),
  );
  // app.useGlobalGuards(new ApiKeyGuard());
  const optons = new DocumentBuilder()
    .setTitle('Nestjs API')
    .setDescription('The Nestjs API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, optons);
  SwaggerModule.setup('api', app, document);
  await app.listen(3000);
}
bootstrap();
