import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto/pagination-query.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('findAll')
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.userService.findAll(paginationQuery);
  }
  @Get('findOne/:id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }
  @Post('createUser')
  createUser(@Body() body: CreateUserDto) {
    return this.userService.create(body);
  }
  @Post('updateUser')
  updateUser(@Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(updateUserDto);
  }
}
