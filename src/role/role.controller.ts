import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { SaveRoleDto } from './dto/save-role.dto';
import { RequiredUUIDPipe } from 'src/common/pipe/optionalUUID.pipe';
import { ApiTags } from '@nestjs/swagger';
import { SetRoleMenusDto } from './dto/set-role-menus.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { SetRoleUsersDto } from './dto/set-role-users.dto';

@ApiTags('role')
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post('saveRole')
  saveRole(@Body() createRoleDto: SaveRoleDto) {
    return this.roleService.saveRole(createRoleDto);
  }

  @Get('getRoles')
  getRoles(@Query() paginationQueryDto: PaginationQueryDto) {
    return this.roleService.getRoles(paginationQueryDto);
  }

  @Get('getRole')
  getRole(@Query('id', RequiredUUIDPipe) id: string) {
    return this.roleService.getRole(id);
  }

  @Post('delRole')
  delRole(@Body('id', RequiredUUIDPipe) id: string) {
    return this.roleService.delRole(id);
  }

  @Post('setRoleMenus')
  setRoleMenus(@Body() setRoleMenusDto: SetRoleMenusDto) {
    return this.roleService.setRoleMenus(setRoleMenusDto);
  }
  @Get('getRoleMenusByRoleId')
  getRoleMenusByRoleId(@Query('id', RequiredUUIDPipe) id: string) {
    return this.roleService.getRoleMenusByRoleId(id);
  }

  @Post('assignUsersToRole')
  assignUsersToRole(@Body() setRoleUsersDto: SetRoleUsersDto) {
    return this.roleService.assignUsersToRole(setRoleUsersDto);
  }
  @Post('removeUsersFromRole')
  removeUsersFromRole(@Body() setRoleUsersDto: SetRoleUsersDto) {
    return this.roleService.removeUsersFromRole(setRoleUsersDto);
  }
  @Get('getRoleUsersByRoleId')
  getRoleUsersByRoleId(@Query('id', RequiredUUIDPipe) id: string) {
    return this.roleService.getRoleUsersByRoleId(id);
  }
}
