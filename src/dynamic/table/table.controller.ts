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
import { TableService } from './table.service';
import { SaveTableDto } from './dto/save-table.dto';
import { RequiredUUIDPipe } from 'src/common/pipe/optionalUUID.pipe';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('dynamic/table')
@Controller('/dynamic/table')
export class TableController {
  constructor(private readonly tableService: TableService) {}

  @Post('saveTable')
  saveTable(@Body() saveTableDto: SaveTableDto) {
    return this.tableService.saveTable(saveTableDto);
  }

  @Get('getTables')
  getTables(@Query() paginationQueryDto: PaginationQueryDto) {
    return this.tableService.getTables(paginationQueryDto);
  }

  @Get('getTable')
  getTable(@Query('id', RequiredUUIDPipe) id: string) {
    return this.tableService.getTable(id);
  }

  @Post('delTable')
  delTable(@Body('id', RequiredUUIDPipe) id: string) {
    return this.tableService.delTable(id);
  }
}
