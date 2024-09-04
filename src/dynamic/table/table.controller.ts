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
import { RequiredUUIDPipe } from 'src/common/pipe/requiredUUID.pipe';
import { ApiTags } from '@nestjs/swagger';
import { PaginationQueryPipe } from 'src/common/pipe/paginationQueryPipe.pipe';
import { PaginationQueryType } from 'src/common/types/pagination-query.type';

@ApiTags('dynamic/table')
@Controller('/dynamic/table')
export class TableController {
  constructor(private readonly tableService: TableService) {}

  @Post('saveTable')
  saveTable(@Body() saveTableDto: SaveTableDto) {
    return this.tableService.saveTable(saveTableDto);
  }

  @Get('getTables')
  getTables(@Query(PaginationQueryPipe) page: PaginationQueryType) {
    return this.tableService.getTables(page);
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
