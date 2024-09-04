import { Injectable } from '@nestjs/common';
import { SaveRoleDto } from './dto/save-role.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SetRoleMenusDto } from './dto/set-role-menus.dto';
import { SetRoleUsersDto } from './dto/set-role-users.dto';
import { PaginationQueryType } from 'src/common/types/pagination-query.type';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}
  async saveRole(saveRoleDto: SaveRoleDto) {
    const { name, description, id } = saveRoleDto;
    return await this.prisma.role.upsert({
      where: { id: id || '' },
      create: {
        name,
        description,
        // users: { connect: userIds?.map((id) => ({ id })) },
        // menus: { connect: menuIds?.map((id) => ({ id })) },
      },
      update: {
        name,
        description,
        // users: { connect: userIds?.map((id) => ({ id })) },
        // menus: { connect: menuIds?.map((id) => ({ id })) },
      },
    });
  }

  async getRoles(paginationQuery: PaginationQueryType) {
    return await this.prisma.extendsService.role.findManyByPagination(
      paginationQuery,
    );
  }

  async getRole(id: string) {
    return await this.prisma.role.findUnique({
      where: { id: id },
    });
  }

  async delRole(id: string) {
    return await this.prisma.role.delete({ where: { id } });
  }

  async getRoleMenusByRoleId(id: string) {
    return (
      await this.prisma.role.findUnique({
        where: { id: id },
        include: { menus: true },
      })
    )?.menus;
  }
  async setRoleMenus(setRoleMenusDto: SetRoleMenusDto) {
    const { id, menuIds } = setRoleMenusDto;
    return await this.prisma.role.update({
      where: { id },
      data: {
        menus: { connect: menuIds.map((id) => ({ id })) },
      },
    });
  }

  async getRoleUsersByRoleId(id: string) {
    return (
      await this.prisma.role.findUnique({
        where: { id: id },
        include: { users: true },
      })
    )?.users;
  }
  // async setRoleUsers(setRoleMenusDto: SetRoleUsersDto) {
  //   const { id, userIds } = setRoleMenusDto;
  //   return await this.prisma.role.update({
  //     where: { id },
  //     data: {
  //       users: { connect: userIds.map((id) => ({ id })) },
  //     },
  //   });
  // }
  /**
   * 将用户分配给角色。
   */
  async assignUsersToRole(setRoleUsersDto: SetRoleUsersDto) {
    const { id, userIds } = setRoleUsersDto;
    return await this.prisma.role.update({
      where: { id },
      data: {
        users: { connect: userIds.map((id) => ({ id })) },
      },
    });
  }
  /**
   * 从角色中移除用户
   */
  async removeUsersFromRole(setRoleUsersDto: SetRoleUsersDto) {
    const { id, userIds } = setRoleUsersDto;
    return await this.prisma.role.update({
      where: { id },
      data: {
        users: { disconnect: userIds.map((id) => ({ id })) },
      },
    });
  }
}
