import { Injectable } from '@nestjs/common';
import { SaveFormDto } from './dto/save-form.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationQueryType } from 'src/common/types/pagination-query.type';

@Injectable()
export class FormService {
  constructor(private prisma: PrismaService) {}
  async saveForm(saveFormDto: SaveFormDto) {
    return await this.prisma.dynamicForm.upsert({
      where: { id: saveFormDto.id || '' },
      update: saveFormDto,
      create: saveFormDto,
    });
  }

  async getForms(paginationQueryDto: PaginationQueryType) {
    return this.prisma.extendsService.dynamicForm.findManyByPagination(
      paginationQueryDto,
    );
  }

  async getForm(id: string) {
    return await this.prisma.dynamicForm.findUnique({
      where: { id },
    });
  }

  async delForm(id: string) {
    return await this.prisma.dynamicForm.delete({
      where: {
        id: id,
      },
    });
  }
}
