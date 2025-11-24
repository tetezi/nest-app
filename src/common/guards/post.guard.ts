/*
 * @Author: tetezi MaHouShouJoTetezi@foxmail.com
 * @Date: 2025-11-20 21:54:54
 * @LastEditors: tetezi MaHouShouJoTetezi@foxmail.com
 * @LastEditTime: 2025-11-21 00:03:22
 * @FilePath: \nest-app\src\common\guards\post.guard.ts
 * @Description:
 */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { UserService } from 'src/user/user.service';

export const ALLOW_PUBLIC_POST_KEY = 'allowPublicPost';
// 装饰器：标记该接口允许普通用户访问（跳过管理员拦截）
export const AllowPublicPost = () => SetMetadata(ALLOW_PUBLIC_POST_KEY, true);
// 守卫
@Injectable()
export class PostGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector, // 注入您的用户服务
    private readonly userService: UserService, // 替换为实际的用户服务
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const isAllowPublicPost = this.reflector.get(
      ALLOW_PUBLIC_POST_KEY,
      context.getHandler(),
    );
    if (!isAllowPublicPost && request.method.toUpperCase() === 'POST') {
      const user = await this.userService.findUserById(
        (<any>request).user.userId,
      );
      if (!user?.isAdmin) {
        // 非管理员发起 POST 请求，直接抛出 403 禁止访问异常
        throw new ForbiddenException('无权限执行该操作，仅管理员可操作');
      }
    }
    return true;
  }
}
