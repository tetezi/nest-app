import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './common/common.module';
import { allConfigFactory } from './config';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { RoleModule } from './role/role.module';
import { MenuModule } from './menu/menu.module';
import { DynamicModule } from './dynamic/dynamic.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: allConfigFactory,
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    CommonModule,
    UserModule,
    RoleModule,
    MenuModule,
    DynamicModule,
  ],
})
export class AppModule {}
