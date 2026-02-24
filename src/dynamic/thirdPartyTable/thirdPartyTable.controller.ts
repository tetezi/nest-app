import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { RequiredUUIDPipe } from 'src/common/pipe/requiredUUID.pipe';
import { ApiTags } from '@nestjs/swagger';
import { PaginationQueryPipe } from 'src/common/pipe/paginationQueryPipe.pipe';
import { PaginationQueryType } from 'src/common/types/pagination-query.type';
import { ThirdPartyTableService } from './thirdPartyTable.service';
import { SaveThirdPartyTableDto } from './dto/saveThirdPartyTable.dto';

@ApiTags('dynamic/thirdPartyTable')
@Controller('/dynamic/thirdPartyTable')
export class ThirdPartyTableController {
  constructor(
    private readonly thirdPartyThirdPartyTableService: ThirdPartyTableService,
  ) {}

  @Post('saveThirdPartyTable')
  saveThirdPartyTable(@Body() saveThirdPartyTableDto: SaveThirdPartyTableDto) {
    return this.thirdPartyThirdPartyTableService.saveThirdPartyTable(
      saveThirdPartyTableDto,
    );
  }

  @Get('getThirdPartyTables')
  getThirdPartyTables(@Query(PaginationQueryPipe) page: PaginationQueryType) {
    return this.thirdPartyThirdPartyTableService.getThirdPartyTables(page);
  }

  @Get('getThirdPartyTable')
  getThirdPartyTable(@Query('id', RequiredUUIDPipe) id: string) {
    return this.thirdPartyThirdPartyTableService.getThirdPartyTable(id);
  }

  @Post('delThirdPartyTable')
  delThirdPartyTable(@Body('id', RequiredUUIDPipe) id: string) {
    return this.thirdPartyThirdPartyTableService.delThirdPartyTable(id);
  }
}
