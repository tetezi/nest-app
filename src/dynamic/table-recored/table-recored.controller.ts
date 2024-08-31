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
import { TableRecoredService } from './table-recored.service';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('dynamic/tableRecored')
@Controller('/dynamic/tableRecored')
export class TableRecoredController {
  constructor(private readonly tableRecoredService: TableRecoredService) {}

  @Post('saveTableRecored')
  saveTableRecored(
    @Query('tableId') tableId: string,
    @Body() saveTableRecoredDto,
  ) {
    return this.tableRecoredService.saveTableRecored(
      tableId,
      saveTableRecoredDto,
    );
  }

  @Get('getTableRecoreds')
  getTableRecoreds(
    @Query('tableId') tableId: string,
    @Query() paginationQueryDto: PaginationQueryDto,
  ) {
    return this.tableRecoredService.getTableRecoreds(
      tableId,
      paginationQueryDto,
    );
  }

  @Get('getTableRecored')
  getTableRecored(@Query('tableId') tableId: string, @Query('id') id: string) {
    return this.tableRecoredService.getTableRecored(tableId, id);
  }
  @Post('delTableRecored')
  delTableRecored(@Body('tableId') tableId: string, @Body('id') id: string) {
    return this.tableRecoredService.delTableRecored(tableId, id);
  }
}
