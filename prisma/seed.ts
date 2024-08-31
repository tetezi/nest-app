import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  /**
   * 创建管理员账号
   */
  await prisma.user.create({
    data: {
      userNo: 'admin',
      name: '系统管理员',
      password: '$2a$10$VUW1lXE7dHWdMl87P7ZWs.jLtk870sciNiWynLe4vlIdHDk4Hytka',
      isAdmin: true,
    },
  });
  /**
   * 创建测试账号
   */
  const testUser = await prisma.user.create({
    data: {
      userNo: 'test',
      name: '测试用户',
      password: '$2a$10$VUW1lXE7dHWdMl87P7ZWs.jLtk870sciNiWynLe4vlIdHDk4Hytka',
    },
  });
  /**
   * 创建测试角色并关联测试账号
   */
  const testRole = await prisma.role.create({
    data: {
      name: '员工',
      description: '通用权限角色',
      users: {
        connect: { id: testUser.id },
      },
    },
  });
  /**
   * 创建管理员菜单
   */
  await prisma.menu.create({
    data: {
      name: '管理员',
      type: 'Group',
      subMenus: {
        createMany: {
          data: [
            {
              name: '菜单管理',
              type: 'View',
              routerPath: '/sys/admin/menu',
              url: '/sys/admin/menu',
            },
            {
              name: '角色管理',
              type: 'View',
              routerPath: '/sys/admin/role',
              url: '/sys/admin/role',
            },
          ],
        },
      },
    },
  });
  /**
   * 创建轻代码菜单
   */
  const dynamicMenu = await prisma.menu.create({
    include: { subMenus: true },
    data: {
      name: '轻代码',
      type: 'Group',
      subMenus: {
        createMany: {
          data: [
            {
              name: '数据表管理',
              type: 'View',
              routerPath: '/sys/dynamic/table',
              url: '/sys/dynamic/table',
            },
          ],
        },
      },
    },
  });
  /**
   * 为测试角色添加轻代码菜单权限
   */
  await prisma.role.update({
    where: { id: testRole.id },
    data: {
      menus: {
        connect: [
          { id: dynamicMenu.id },
          ...dynamicMenu.subMenus.map((subMenu) => ({ id: subMenu.id })),
        ],
      },
    },
  });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
