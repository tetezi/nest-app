import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Role } from './entities/role.entity';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}
  async findAll(paginationQuery: PaginationQueryDto) {
    const { page, limit } = paginationQuery;
    const skip = (page - 1) * limit;

    return this.userRepository.find({
      relations: ['roles'],
      skip: skip,
      take: limit,
    });
  }
  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
    });
    if (user) {
      return user;
    } else {
      throw new NotFoundException('User not found');
    }
  }
  private async associateRoles(user: User, roleIds: string[] | undefined) {
    if (roleIds) {
      const roles = await Promise.all(
        roleIds.map(async (roleId) => {
          const role = await this.roleRepository.findOneBy({ id: roleId });
          if (!role) {
            throw new NotFoundException(`Role with ID ${roleId} not found`);
          }
          return role;
        }),
      );

      user.roles = roles;
    }
  }
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { roleIds, ...userData } = createUserDto;
    const existingUser = await this.userRepository.findOneBy({
      userNo: userData.userNo,
    });
    if (existingUser) {
      throw new ConflictException(`${userData.userNo} already exists`);
    }
    const user = this.userRepository.create(userData);

    await this.associateRoles(user, roleIds);

    return await this.userRepository.save(user);
  }

  async update(updateUserDto: UpdateUserDto) {
    const { roleIds, ...userData } = updateUserDto;
    const user = await this.userRepository.preload(userData);
    if (user) {
      await this.associateRoles(user, roleIds);
      return this.userRepository.save(user);
    } else {
      throw new NotFoundException('User not found');
    }
  }
  async remove(id: string) {
    const user = await this.findOne(id);
    return this.userRepository.remove(user);
  }
}
