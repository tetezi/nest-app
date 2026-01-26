/*
 * @Author: tetezi MaHouShouJoTetezi@foxmail.com
 * @Date: 2025-11-20 23:15:21
 * @LastEditors: tetezi MaHouShouJoTetezi@foxmail.com
 * @LastEditTime: 2025-11-20 23:49:50
 * @FilePath: \nest-app\src\common\guards\jwt.guard.ts
 * @Description:
 */
import {
  ExecutionContext,
  HttpStatus,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { createHttpError } from 'src/utils/createHttpError';

// 定义「无需 JWT 认证」的装饰器 key（和 NoAdminRequired 逻辑一致）
export const NO_JWT_REQUIRED_KEY = 'noJwtRequired';

// 装饰器：标记接口无需 JWT 认证（如登录、注册）
export const NoJwtRequired = () => SetMetadata(NO_JWT_REQUIRED_KEY, true);
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  // 重写 canActivate 方法，支持「无需认证」装饰器
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // 1. 检查接口是否有 @NoJwtRequired() 装饰器，有则直接放行（公开接口）
    const isNoJwtRequired = this.reflector.get(
      NO_JWT_REQUIRED_KEY,
      context.getHandler(),
    );
    if (isNoJwtRequired) {
      return true;
    }

    return super.canActivate(context);
  }
  //  重写 handleRequest 方法自定义错误信息
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      let message = '登录状态失效，请重新登录';
      if (info?.name === 'TokenExpiredError') {
        message = '登录已过期，请重新登录';
      } else if (info?.name === 'JsonWebTokenError') {
        message = '无效的令牌，请提供正确的token';
      }

      throw createHttpError(message, HttpStatus.UNAUTHORIZED, err);
    }
    console.log('user', user);
    return user;
  }
}
