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

@ApiTags('role')
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post('saveRole')
  saveRole(@Body() createRoleDto: SaveRoleDto) {
    return this.roleService.saveRole(createRoleDto);
  }
  @Post('setRoleMenus')
  setRoleMenus(@Body() setRoleMenusDto: SetRoleMenusDto) {
    return this.roleService.setRoleMenus(setRoleMenusDto);
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
  @Get('getMenusByRoleId')
  getMenusByRoleId(@Query('id', RequiredUUIDPipe) id: string) {
    return this.roleService.getMenusByRoleId(id);
  }
}
