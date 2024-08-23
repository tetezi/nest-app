import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { RequiredUUIDPipe } from 'src/common/pipe/optionalUUID.pipe';
import { AuthGuard } from '@nestjs/passport';
import { SetUserRolesDto } from './dto/set-user-roles.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
  @Post('setUserRoles')
  setUserRoles(@Body() setUserRolesDto: SetUserRolesDto) {
    return this.userService.setUserRoles(setUserRolesDto);
  }
  @Get('getAllUsers')
  getAllUsers(@Query() paginationQueryDto: PaginationQueryDto) {
    return this.userService.getAllUsers(paginationQueryDto);
  }

  @Get('findOne')
  findOne(@Query('id', RequiredUUIDPipe) id: string) {
    return this.userService.findUserById(id);
  }

  // @Post('update')
  // update(
  //   @Query('id', new ParseUUIDPipe({ version: '4' })) id: string,
  //   @Body() updateUserDto: UpdateUserDto,
  // ) {
  //   return this.userService.update(id, updateUserDto);
  // }

  @Post('remove')
  remove(@Query('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.userService.remove(id);
  }
}
