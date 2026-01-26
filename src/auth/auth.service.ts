import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AllConfigType } from 'src/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { RoleService } from 'src/role/role.service';
import { Menu, User } from '@prisma/client';
import { MenuService } from 'src/menu/menu.service';
import { createHttpError } from 'src/utils/createHttpError';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private roleService: RoleService,
    private menuService: MenuService,
    private prisma: PrismaService,
    private configService: ConfigService<AllConfigType>,
  ) {}

  async authLogin(loginDto: AuthLoginDto) {
    const { userNo, password } = loginDto;
    const user = await this.userService.findUserByUserNo(userNo);
    if (!user) {
      throw createHttpError(
        '用户名或密码错误，请重新输入',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid password');
    }
    const tokenExpiresIn = this.configService.getOrThrow('auth.expires', {
      infer: true,
    });
    const jwtPayload = {
      userId: user.id,
    };
    const accessToken = await this.jwtService.signAsync(jwtPayload, {
      secret: this.configService.getOrThrow('auth.secret', { infer: true }),
      expiresIn: tokenExpiresIn,
    });
    return {
      accessToken,
      user: {
        userId: user.id,
        userNo: user.userNo,
        name: user.name,
      },
    };
  }
  async getMenuPermissionsByUserId(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        isAdmin: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }
    if (user.isAdmin) {
      return this.menuService.findAllMenusAsTree();
    } else {
      const roles = await this.prisma.role.findMany({
        where: { users: { some: { id: userId } } },
        include: {
          menus: {
            where: {
              isEnabled: true,
            },
          },
        },
      });
      type MenuWithSubMenus = Menu & { subMenus: Menu[] };
      const menus = roles.flatMap((role) => role.menus);
      const menuMap = new Map<string, MenuWithSubMenus>();
      const sortMenusBySortField = (a: Menu, b: Menu) => {
        return (a.sort ?? 0) - (b.sort ?? 0);
      };
      menus.forEach((menu) => {
        menuMap.set(menu.id, { ...menu, subMenus: [] });
      });

      const rootMenus: MenuWithSubMenus[] = [];

      menus.forEach((menu) => {
        if (menu.parentMenuId) {
          const parentMenu = menuMap.get(menu.parentMenuId);
          if (parentMenu) {
            const menuWithSubMenus = menuMap.get(menu.id);
            if (menuWithSubMenus) {
              parentMenu.subMenus.push(menuWithSubMenus);
              parentMenu.subMenus.sort(sortMenusBySortField);
            }
          }
        } else {
          const menuWithSubMenus = menuMap.get(menu.id);
          if (menuWithSubMenus) {
            rootMenus.push(menuWithSubMenus);
          }
        }
      });
      rootMenus.sort(sortMenusBySortField);
      return rootMenus;
    }
  }
}
