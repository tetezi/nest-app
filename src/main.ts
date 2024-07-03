import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';

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
  await app.listen(3000);
}
bootstrap();
