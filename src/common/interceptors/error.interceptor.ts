import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  BadRequestException,
  InternalServerErrorException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

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
        // 如果错误是 PrismaClientKnownRequestError 实例，抛出 BadRequestException
        if (error instanceof PrismaClientKnownRequestError) {
          /**
           *  TODO: 要把对应状态码的都加上对应的code和message，而不是全丢400
           */
          return throwError(
            () =>
              new BadRequestException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Bad Request',
                error,
              }),
          );
        }
        // 对于其他未知类型的错误，抛出 InternalServerErrorException
        /**
         *  TODO: 以后再搞个错误日志的插件
         */
        console.error(error);
        return throwError(
          () =>
            new InternalServerErrorException({
              statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
              message: 'Internal Server Error',
              error,
            }),
        );
      }),
    );
  }
}
