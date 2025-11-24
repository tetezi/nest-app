/*
 * @Author: tetezi MaHouShouJoTetezi@foxmail.com
 * @Date: 2024-09-26 13:47:05
 * @LastEditors: tetezi MaHouShouJoTetezi@foxmail.com
 * @LastEditTime: 2025-11-24 10:32:06
 * @FilePath: \nest-app\src\main.ts
 * @Description:
 */
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from './config';
import { networkInterfaces } from 'os';
function getNetworkIp() {
  const nets = networkInterfaces();
  let ip = '';

  Object.keys(nets).forEach((name) => {
    nets[name]?.forEach((net) => {
      // 跳过内部地址和IPv6地址
      if (!net.internal && net.family === 'IPv4') {
        ip = net.address;
      }
    });
  });

  return ip || 'localhost';
}
// 引导应用程序启动的主函数
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const configService = app.get(ConfigService<AllConfigType>);
  // 启用版本控制功能
  app.enableVersioning({
    type: VersioningType.URI,
  });
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

  // 获取可用端口;
  const port = configService.getOrThrow('app.port', { infer: true });

  // 启动应用并监听指定端口;
  await app.listen(port);
  const networkIp = getNetworkIp();

  console.log(
    [
      `启动成功`,
      `Application is running on: http://localhost:${port}`,
      `Local Network Access: http://${networkIp}:${port}`,
      `Docs is running on http://${networkIp}:${port}/docs`,
    ].join('\n'),
  );
}
void bootstrap();
