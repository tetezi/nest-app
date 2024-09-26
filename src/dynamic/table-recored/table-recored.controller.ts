import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { TableRecoredService } from './table-recored.service';
import { ApiTags } from '@nestjs/swagger';
import { PaginationQueryPipe } from 'src/common/pipe/paginationQueryPipe.pipe';
import { PaginationQueryType } from 'src/common/types/pagination-query.type';

@ApiTags('dynamic/tableRecored')
@Controller('/dynamic/tableRecored')
export class TableRecoredController {
  constructor(private readonly tableRecoredService: TableRecoredService) {}

  @Post('saveTableRecored')
  saveTableRecored(
    @Query('tableId') tableId: string,
    @Query('tableName') tableName: string,
    @Body() saveTableRecoredDto,
  ) {
    return this.tableRecoredService.saveTableRecored(
      tableId || tableName,
      saveTableRecoredDto,
    );
  }

  @Get('getTableRecoreds')
  getTgetTableRecoredsables(
    @Query('tableId') tableId: string,
    @Query('tableName') tableName: string,
    @Query(PaginationQueryPipe) page: PaginationQueryType,
  ) {
    return this.tableRecoredService.getTableRecoreds(
      tableId || tableName,
      page,
    );
  }

  @Get('getTableRecored')
  getTableRecored(
    @Query('tableId') tableId: string,
    @Query('tableName') tableName: string,
    @Query('id') id: string,
  ) {
    return this.tableRecoredService.getTableRecored(tableId || tableName, id);
  }
  @Post('delTableRecored')
  delTableRecored(
    @Body('tableId') tableId: string,
    @Body('tableName') tableName: string,
    @Body('id') id: string,
  ) {
    return this.tableRecoredService.delTableRecored(tableId || tableName, id);
  }
}
