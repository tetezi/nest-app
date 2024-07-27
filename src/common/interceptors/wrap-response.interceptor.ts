import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

// 包装响应的拦截器
@Injectable()
export class WrapResponseInterceptor implements NestInterceptor {
  // 拦截方法，处理请求并包装响应
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();
    return next.handle().pipe(
      map((data) => {
        return {
          statusCode: response.statusCode,
          data: data,
        };
      }),
    );
  }
}
