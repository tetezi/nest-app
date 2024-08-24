import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { MenuService } from './menu.service';
import { RequiredUUIDPipe } from 'src/common/pipe/optionalUUID.pipe';
import { ApiTags } from '@nestjs/swagger';
import { SaveMenuDto } from './dto/save-menu.dto';

@ApiTags('menu')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post('saveMenu')
  saveMenu(@Body() saveMenuDto: SaveMenuDto) {
    return this.menuService.saveMenu(saveMenuDto);
  }
  @Get('getAllMenu')
  getAllMenu() {
    return this.menuService.findAllMenusAsTree();
  }

  @Get('getMenu')
  getMenu(@Query('id', RequiredUUIDPipe) id: string) {
    return this.menuService.findMenuById(id);
  }

  @Post('delMenu')
  delMenu(@Body('id', RequiredUUIDPipe) id: string) {
    return this.menuService.delMenu(id);
  }
}
