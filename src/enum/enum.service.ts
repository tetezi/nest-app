import { Injectable } from '@nestjs/common';
import { SaveEnumCategoryDto } from './dto/save-enum.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationQueryType } from 'src/common/types/pagination-query.type';

@Injectable()
export class EnumService {
  constructor(private prisma: PrismaService) {}

  async saveEnumCategory(saveEnumCategoryDto: SaveEnumCategoryDto) {
    const {
      id = '',
      name,
      title,
      description,
      details = [],
    } = saveEnumCategoryDto;
    const newDetails = details.filter(({ id }) => id === undefined);
    const oldDetails = details.filter(({ id }) => id !== undefined);
    return await this.prisma.enumCategory.upsert({
      where: { id: id },
      update: {
        name,
        title,
        description,
        details: {
          deleteMany: {
            id: {
              notIn: oldDetails.map(({ id }) => id as string),
            },
          },
          update: oldDetails.map((detail) => ({
            where: { id: detail.id },
            data: detail,
          })),
          createMany: {
            data: newDetails,
          },
        },
      },
      create: {
        name,
        title,
        description,
        details: {
          create: details.map((detail) => ({
            value: detail.value,
            name: detail.name,
          })),
        },
      },
    });
  }

  async getEnumCategorys(paginationQueryDto: PaginationQueryType) {
    return this.prisma.extendsService.enumCategory.findManyByPagination(
      paginationQueryDto,
      {
        include: {
          details: true,
        },
      },
    );
  }

  async getEnumDetails(paginationQueryDto: PaginationQueryType) {
    return this.prisma.extendsService.enumDetail.findManyByPagination(
      paginationQueryDto,
      {
        include: {
          category: true,
        },
      },
    );
  }
  async getEnumCategory(categoryName: string) {
    return this.prisma.enumCategory.findUnique({
      where: { name: categoryName },
      include: { details: true },
    });
  }

  async delEnumCategory(id: string) {
    return await this.prisma.enumCategory.delete({
      where: {
        id: id,
      },
    });
  }
  async checkEnum(enumCategoryId: string, valueOrName: string) {
    const enumCategory = await this.prisma.enumCategory.findUnique({
      where: { id: enumCategoryId },
      include: { details: true },
    });
    if (enumCategory) {
      const enumDetail = enumCategory.details.find((detail) => {
        return valueOrName === detail.value || valueOrName === detail.name;
      });
      if (enumDetail) {
        return enumDetail;
      } else {
        throw new Error(
          `找不到[${enumCategory.name}]枚举类型下的枚举值：[${valueOrName}] ，请检查`,
        );
      }
    } else {
      throw new Error(`找不到${enumCategoryId}枚举类型： ，请检查`);
    }
  }
}
