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
      dynamicThirdPartyTableId,
      dynamicFormId,
      name,
      tableColumns,
      dataSourceType,
      formSourceType,
    } = saveDto;
    const data = {
      name,
      tableColumns,
      dataSourceType,
      dynamicTable:
        dataSourceType === 'DynamicTable'
          ? {
              connect: { id: dynamicTableId },
            }
          : id
          ? { disconnect: true }
          : undefined,
      dynamicThirdPartyTable:
        dataSourceType === 'DynamicThirdPartyTable'
          ? {
              connect: { id: dynamicThirdPartyTableId },
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
    if (id) {
      return await this.prisma.dynamicFormViewComp.update({
        where: { id: id || '' },
        data: data,
      });
    } else {
      await this.prisma.dynamicFormViewComp.create({
        data: data,
      });
    }
    // await this.prisma.dynamicFormViewComp.upsert({
    //   where: { id: id || '' },
    //   update: data,
    //   create: data,
    // });
  }

  async getFormViewComps(paginationQueryDto: PaginationQueryType) {
    return this.prisma.extendsService.dynamicFormViewComp.findManyByPagination(
      paginationQueryDto,
      {
        include: {
          dynamicForm: true,
          dynamicTable: true,
          dynamicThirdPartyTable: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    );
  }

  async getFormViewComp(id: string) {
    return await this.prisma.dynamicFormViewComp.findUnique({
      where: { id },
      include: {
        dynamicForm: true,
        dynamicTable: true,
        dynamicThirdPartyTable: true,
      },
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
