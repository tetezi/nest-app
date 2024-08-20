import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { SetUserRolesDto } from './dto/set-user-roles.dto';
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  async create(createUserDto: CreateUserDto) {
    const { roleIds, password, name, userNo, email, phone } = createUserDto;
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);
    return this.prisma.user.create({
      data: {
        password: hashPassword,
        name,
        userNo,
        email,
        phone,
        roles: { connect: roleIds?.map((id) => ({ id })) },
      },
    });
  }
  async findAll() {
    return this.prisma.user.findMany();
  }
  async findUserById(id: string) {
    return await this.prisma.user.findUnique({
      where: { id: id },
    });
  }
  async findUserByUserNo(userNo: string) {
    return await this.prisma.user.findUnique({
      where: { userNo: userNo },
    });
  }
  async getRolesByUserId(id: string) {
    return (
      await this.prisma.user.findUnique({
        where: { id: id },
        include: { roles: true },
      })
    )?.roles;
  }
  async remove(id: string) {
    return await this.prisma.user.delete({ where: { id } });
  }
  async setUserRoles(setUserRolesDto: SetUserRolesDto) {
    const { id, roleIds } = setUserRolesDto;
    return await this.prisma.user.update({
      data: {
        roles: {
          connect: roleIds.map((id) => ({ id })),
        },
      },
      where: {
        id,
      },
    });
  }
}
