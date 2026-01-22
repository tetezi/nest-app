/*
 * @Author: tetezi MaHouShouJoTetezi@foxmail.com
 * @Date: 2024-07-08 14:17:41
 * @LastEditors: tetezi MaHouShouJoTetezi@foxmail.com
 * @LastEditTime: 2025-11-20 23:53:26
 * @FilePath: \nest-app\src\common\common.module.ts
 * @Description:
 */
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
  ValidationPipe,
} from '@nestjs/common';
import { LoggingMiddleware } from './middleware/logging.middleware';
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';
import { WrapResponseInterceptor } from './interceptors/wrap-response.interceptor';
import validationOptions from './pipe/validation-options';
import { ResolvePromisesInterceptor } from './interceptors/resolve-promises';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { DateConversionInterceptor } from './interceptors/date-conversion';
import { JwtAuthGuard } from './guards/jwt.guard';
import { UserModule } from 'src/user/user.module';
@Module({
  imports: [UserModule],
  providers: [
    // {
    //   provide: APP_GUARD,
    //   // 全局API密钥守卫，用于验证API请求
    //   useClass: ApiKeyGuard,
    // },
    // { provide: APP_FILTER, useClass: PrismaClientExceptionFilter },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      // 全局拦截器，用于解析Promise
      useClass: ResolvePromisesInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      // 全局拦截器，用于解析日期格式
      useClass: DateConversionInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      // 全局拦截器，用于包装响应
      useClass: WrapResponseInterceptor,
    },
    /**
     * TODO: 未确定覆盖超时方案，后续修改方案
     */
    {
      provide: APP_INTERCEPTOR,
      // 全局拦截器，用于处理请求超时
      useClass: TimeoutInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      // 全局拦截器，用于处理错误
      useClass: ErrorInterceptor,
    },

    {
      provide: APP_PIPE,
      // 全局管道，用于验证请求数据
      useFactory: () => {
        return new ValidationPipe(validationOptions);
      },
    },
  ],
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggingMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.GET });
  }
}
