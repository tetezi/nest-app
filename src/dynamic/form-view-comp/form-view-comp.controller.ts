import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { RequiredUUIDPipe } from 'src/common/pipe/requiredUUID.pipe';
import { SaveFormViewCompDto } from './dto/save-form-view-comp.dto';
import { FormViewCompService } from './form-view-comp.service';
import { ApiTags } from '@nestjs/swagger';
import { PaginationQueryPipe } from 'src/common/pipe/paginationQueryPipe.pipe';
import { PaginationQueryType } from 'src/common/types/pagination-query.type';

@ApiTags('dynamic/formViewComp')
@Controller('/dynamic/formViewComp')
export class FormViewCompController {
  constructor(private readonly formViewCompService: FormViewCompService) {}

  @Post('saveFormViewComp')
  saveFormViewComp(@Body() saveDto: SaveFormViewCompDto) {
    return this.formViewCompService.saveFormViewComp(saveDto);
  }

  @Get('getFormViewComps')
  getFormViewComps(
    @Query(PaginationQueryPipe) paginationQueryDto: PaginationQueryType,
  ) {
    return this.formViewCompService.getFormViewComps(paginationQueryDto);
  }

  @Get('getFormViewComp')
  getFormViewComp(@Query('id', RequiredUUIDPipe) id: string) {
    return this.formViewCompService.getFormViewComp(id);
  }

  @Post('delFormViewComp')
  delFormViewComp(@Body('id', RequiredUUIDPipe) id: string) {
    return this.formViewCompService.delFormViewComp(id);
  }
}
