import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthGuard } from '@nestjs/passport';
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() authLoginDto: AuthLoginDto) {
    return this.authService.authLogin(authLoginDto);
  }
  /**
   * TODO: 再加个退出登录，注销session，但是前置要等加完session数据表存登录会话的功能
   */
  @Get('getMenuPermission')
  @UseGuards(AuthGuard('jwt'))
  getMenuPermission(@Req() req) {
    return this.authService.getMenuPermissionsByUserId(req.user.userId);
  }
}
