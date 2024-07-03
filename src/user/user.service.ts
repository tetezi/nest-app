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
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto/pagination-query.dto';
import { Role } from './entities/role.entity';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  findAll(paginationQuery: PaginationQueryDto) {
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
  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOneBy({
      userNo: createUserDto.userNo,
    });
    if (existingUser) {
      throw new ConflictException(`${createUserDto.userNo} already exists`);
    }

    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async update(updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.preload(updateUserDto);
    if (user) {
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
