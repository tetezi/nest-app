import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from './config';

// 引导应用程序启动的主函数
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService<AllConfigType>);
  // 启用版本控制功能
  app.enableVersioning({
    type: VersioningType.URI,
  });
  // 使用全局管道进行验证
  // app.useGlobalPipes(new ValidationPipe(validationOptions));
  // 使用全局拦截器
  app.useGlobalInterceptors(
    // 类序列化拦截器
    new ClassSerializerInterceptor(app.get(Reflector)),
  );
  // app.useGlobalGuards(new ApiKeyGuard());

  // 创建Swagger文档的配置选项
  const options = new DocumentBuilder()
    .setTitle('API') // 设置API文档的标题
    .setDescription('API docs') // 设置API文档的描述
    .setVersion('1.0') // 设置API文档的版本
    .addBearerAuth() // 添加Bearer认证支持
    .build(); // 构建配置选项

  // 使用配置选项创建Swagger文档
  const document = SwaggerModule.createDocument(app, options);

  // 设置Swagger文档的访问路径
  SwaggerModule.setup('docs', app, document);

  // 启动应用并监听指定端口;
  await app.listen(configService.getOrThrow('app.port', { infer: true }));
  console.log(`Application is running on: ${await app.getUrl()}`);
}
void bootstrap();
