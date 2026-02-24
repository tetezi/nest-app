import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationQueryType } from 'src/common/types/pagination-query.type';
import { SaveThirdPartyTableDto } from './dto/saveThirdPartyTable.dto';

@Injectable()
export class ThirdPartyTableService {
  constructor(private prisma: PrismaService) {}

  async saveThirdPartyTable(saveThirdPartyTableDto: SaveThirdPartyTableDto) {
    return await this.prisma.dynamicThirdPartyTable.upsert({
      where: {
        id: saveThirdPartyTableDto.id || '',
      },
      update: saveThirdPartyTableDto,
      create: saveThirdPartyTableDto,
    });
  }

  async getThirdPartyTables(paginationQueryDto: PaginationQueryType) {
    return this.prisma.extendsService.dynamicThirdPartyTable.findManyByPagination(
      paginationQueryDto,
      {
        orderBy: { createdAt: 'desc' },
      },
    );
  }

  async getThirdPartyTable(id: string) {
    return await this.prisma.dynamicThirdPartyTable.findFirst({
      where: {
        OR: [{ id: id }],
      },
    });
  }

  async delThirdPartyTable(id: string) {
    return await this.prisma.dynamicThirdPartyTable.delete({
      where: {
        id: id,
      },
    });
  }
}
