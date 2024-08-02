import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
  ValidationPipe,
} from '@nestjs/common';
import { LoggingMiddleware } from './middleware/logging.middleware';
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ApiKeyGuard } from './guards/api-key.guard';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';
import { WrapResponseInterceptor } from './interceptors/wrap-response.interceptor';
import validationOptions from './pipe/validation-options';
import { ResolvePromisesInterceptor } from './interceptors/resolve-promises';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      // 全局API密钥守卫，用于验证API请求
      useClass: ApiKeyGuard,
    },

    {
      provide: APP_INTERCEPTOR,
      // 全局拦截器，用于解析Promise
      useClass: ResolvePromisesInterceptor,
    },

    {
      provide: APP_INTERCEPTOR,
      // 全局拦截器，用于包装响应
      useClass: WrapResponseInterceptor,
    },
    /**
     * 暂时关闭超时拦截器，未确定覆盖超时方案
     */
    // {
    //   provide: APP_INTERCEPTOR,
    //   // 全局拦截器，用于处理请求超时
    //   useClass: TimeoutInterceptor,
    // },

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
