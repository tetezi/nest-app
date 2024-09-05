import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { FormService } from './form.service';
import { RequiredUUIDPipe } from 'src/common/pipe/requiredUUID.pipe';
import { SaveFormDto } from './dto/save-form.dto';
import { ApiTags } from '@nestjs/swagger';
import { PaginationQueryPipe } from 'src/common/pipe/paginationQueryPipe.pipe';
import { PaginationQueryType } from 'src/common/types/pagination-query.type';

@ApiTags('dynamic/form')
@Controller('/dynamic/form')
export class FormController {
  constructor(private readonly formService: FormService) {}

  @Post('saveForm')
  saveForm(@Body() saveFormDto: SaveFormDto) {
    return this.formService.saveForm(saveFormDto);
  }

  @Get('getForms')
  getForms(
    @Query(PaginationQueryPipe) paginationQueryDto: PaginationQueryType,
  ) {
    return this.formService.getForms(paginationQueryDto);
  }

  @Get('getForm')
  getForm(@Query('id', RequiredUUIDPipe) id: string) {
    return this.formService.getForm(id);
  }

  @Post('delForm')
  delForm(@Body('id', RequiredUUIDPipe) id: string) {
    return this.formService.delForm(id);
  }
}
