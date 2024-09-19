import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { EnumService } from './enum.service';
import { SaveEnumCategoryDto } from './dto/save-enum.dto';
import { RequiredUUIDPipe } from 'src/common/pipe/requiredUUID.pipe';
import { PaginationQueryPipe } from 'src/common/pipe/paginationQueryPipe.pipe';
import { PaginationQueryType } from 'src/common/types/pagination-query.type';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('enum')
@Controller('enum')
export class EnumController {
  constructor(private readonly enumService: EnumService) {}

  @Post('saveEnumCategory')
  saveEnumCategory(@Body() saveEnumCategoryDto: SaveEnumCategoryDto) {
    return this.enumService.saveEnumCategory(saveEnumCategoryDto);
  }

  @Get('getEnumCategorys')
  getEnumCategorys(@Query(PaginationQueryPipe) page: PaginationQueryType) {
    return this.enumService.getEnumCategorys(page);
  }
  @Get('getEnumDetails')
  getEnumDetails(@Query(PaginationQueryPipe) page: PaginationQueryType) {
    return this.enumService.getEnumDetails(page);
  }

  @Get('getEnumCategory')
  getEnumCategory(@Query('categoryName') categoryName: string) {
    return this.enumService.getEnumCategory(categoryName);
  }

  @Post('delEnumCategory')
  delEnumCategory(@Body('id', RequiredUUIDPipe) id: string) {
    return this.enumService.delEnumCategory(id);
  }
}
