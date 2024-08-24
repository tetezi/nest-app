import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SaveMenuDto } from './dto/save-menu.dto';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}
  async saveMenu(saveMenuDto: SaveMenuDto) {
    return await this.prisma.menu.upsert({
      where: { id: saveMenuDto.id || '' },
      update: saveMenuDto,
      create: saveMenuDto,
    });
  }
  async findAllMenusAsTree() {
    const getSubMenus = async ({ id }: { id: string }) => {
      const menu = await this.prisma.menu.findUnique({
        where: { id },
        include: { subMenus: true },
      });
      if (menu === null) {
        throw new Error('Menu not found');
      }
      if (menu.subMenus.length > 0) {
        menu.subMenus = await Promise.all(menu.subMenus.map(getSubMenus));
      }
      return menu;
    };

    const rootMenus = await this.prisma.menu.findMany({
      where: {
        parentMenuId: null,
      },
      select: { id: true },
    });
    return await Promise.all(rootMenus.map(getSubMenus));
  }

  async findMenuById(id: string) {
    return await this.prisma.menu.findUnique({
      where: { id: id },
    });
  }

  async delMenu(id: string) {
    return await this.prisma.$transaction(async () => {
      const menu = await this.prisma.menu.findUnique({
        where: { id },
        include: {
          subMenus: true,
        },
      });
      if (menu) {
        await this.prisma.menu.delete({
          where: {
            id: id,
          },
        });
        if (menu.subMenus?.length > 0) {
          await Promise.all(
            menu.subMenus.map(async (subMenu) => {
              return await this.delMenu(subMenu.id);
            }),
          );
        }
      }
    });
  }
}
