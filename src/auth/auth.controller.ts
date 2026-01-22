/*
 * @Author: tetezi MaHouShouJoTetezi@foxmail.com
 * @Date: 2024-08-14 15:25:08
 * @LastEditors: tetezi MaHouShouJoTetezi@foxmail.com
 * @LastEditTime: 2025-11-20 23:33:16
 * @FilePath: \nest-app\src\auth\auth.controller.ts
 * @Description:
 */
import { Controller, Post, Body, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthLoginDto } from './dto/auth-login.dto';
import { NoJwtRequired } from 'src/common/guards/jwt.guard';
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @NoJwtRequired()
  @Post('login')
  login(@Body() authLoginDto: AuthLoginDto) {
    return this.authService.authLogin(authLoginDto);
  }
  /**
   * TODO: 再加个退出登录，注销session，但是前置要等加完session数据表存登录会话的功能
   */
  @Get('getMenuPermission')
  getMenuPermission(@Req() req) {
    return this.authService.getMenuPermissionsByUserId(req.user.userId);
  }
}
