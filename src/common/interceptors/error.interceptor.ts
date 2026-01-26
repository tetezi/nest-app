import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { createHttpError } from '../../utils/createHttpError';

/**
 * ErrorInterceptor 类用于捕获并处理 HTTP 请求中的错误。
 * 它实现了 NestInterceptor 接口，通过拦截器机制在请求处理过程中捕获错误。
 */
@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        // 如果错误是 HttpException 实例，直接抛出
        if (error instanceof HttpException) {
          return throwError(() => error);
        }
        // 如果错误是 PrismaClientKnownRequestError 实例，根据状态码二次判断
        else if (error instanceof PrismaClientKnownRequestError) {
          const { code } = error;
          const Error400Map = new Map([
            ['P2002', '唯一约束冲突'],
            ['P2000', '字段值超出数据库长度'],
            ['P2003', '外键约束失败'],
            ['P2025', '记录未找到'],
            ['P2004', '约束验证失败'],
          ]);
          const Error500Map = new Map([
            ['P2010', '数据库查询超时'],
            ['P2021', '表 / 列不存在'],
            ['P2022', '列不存在'],
            ['P2014', '变更违反唯一约束'],
          ]);
          if (Error400Map.has(code)) {
            return throwError(() =>
              createHttpError(
                Error400Map.get(code),
                HttpStatus.BAD_REQUEST,
                error,
              ),
            );
          } else if (Error500Map.has(code)) {
            return throwError(() =>
              createHttpError(
                Error500Map.get(code),
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
              ),
            );
          } else {
            return throwError(() =>
              createHttpError(
                '内部服务器错误,数据库层面的已知错误',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
              ),
            );
          }
        } else if (error instanceof PrismaClientValidationError) {
          return throwError(() =>
            createHttpError(
              '内部服务器错误,客户端参数校验失败',
              HttpStatus.INTERNAL_SERVER_ERROR,
              error,
            ),
          );
        } else {
          // 对于其他未知类型的错误，抛出 InternalServerErrorException
          /**
           *  TODO: 以后再搞个错误日志的插件
           */
          return throwError(() =>
            createHttpError(
              '内部服务器错误',
              HttpStatus.INTERNAL_SERVER_ERROR,
              error,
            ),
          );
        }
      }),
    );
  }
}
