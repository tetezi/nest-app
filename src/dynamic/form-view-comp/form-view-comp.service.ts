import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SaveFormViewCompDto } from './dto/save-form-view-comp.dto';
import { PaginationQueryType } from 'src/common/types/pagination-query.type';

@Injectable()
export class FormViewCompService {
  constructor(private prisma: PrismaService) {}
  async saveFormViewComp(saveDto: SaveFormViewCompDto) {
    const {
      id,
      dynamicTableId,
      dynamicFormId,
      name,
      dataSourceType,
      formSourceType,
    } = saveDto;
    const data = {
      name,
      dataSourceType,
      dynamicTable:
        dataSourceType === 'DynamicTable'
          ? {
              connect: { id: dynamicTableId },
            }
          : id
          ? { disconnect: true }
          : undefined,
      formSourceType,
      dynamicForm:
        formSourceType === 'DynamicForm'
          ? {
              connect: { id: dynamicFormId },
            }
          : id
          ? { disconnect: true }
          : undefined,
    };
    await this.prisma.dynamicFormViewComp.upsert({
      where: { id: id || '' },
      update: data,
      create: data,
    });
  }

  async getFormViewComps(paginationQueryDto: PaginationQueryType) {
    return this.prisma.extendsService.dynamicFormViewComp.findManyByPagination(
      paginationQueryDto,
      { include: { dynamicForm: true, dynamicTable: true } },
    );
  }

  async getFormViewComp(id: string) {
    return await this.prisma.dynamicFormViewComp.findUnique({
      where: { id },
      include: { dynamicForm: true, dynamicTable: true },
    });
  }

  async delFormViewComp(id: string) {
    return await this.prisma.dynamicFormViewComp.delete({
      where: {
        id: id,
      },
    });
  }
}
