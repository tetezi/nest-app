import { Injectable } from '@nestjs/common';
import { SaveTableColDto, SaveTableDto } from './dto/save-table.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

@Injectable()
export class TableService {
  constructor(private prisma: PrismaService) {}

  async saveTable(saveTableDto: SaveTableDto) {
    /**
     * TODO:此处需要限制能匹配上数据库以后表及字段，以及加多个接口查询可用表及字段
     */
    const { id, cols = [], ...tableData } = saveTableDto;
    if (id) {
      for (const col of cols) {
        if (col.colType === 'SubTable') {
          if (!col.subTableId) {
            throw new Error('subTable相关参数不能为空');
          } else if (col.subTableType === undefined) {
            throw new Error('subTable相关参数不能为空');
          } else if (col.canQuery && col.subTableQueryStrategy === undefined) {
            throw new Error('subTable相关参数不能为空');
          } else if (
            col.canWritable &&
            col.subTableWritableStrategy === undefined
          ) {
            throw new Error('subTable相关参数不能为空');
          }
          const subtable = await this.getTable(col.subTableId);
          if (!subtable) {
            throw new Error(`<${col.name}>,id为${col.subTableId}的子表不存在`);
          }
          if (col.subTableQueryStrategy === 'PartialObject') {
            //TODO:校验节选字段是否存在于子表配置
          }
        }
      }
      const oldCols = cols.filter(({ id }) => id !== undefined);
      const newCols = cols.filter(({ id }) => id === undefined);

      return await this.prisma.table.update({
        where: { id: id },
        data: {
          ...tableData,
          cols: {
            deleteMany: {
              id: {
                notIn: oldCols.map(({ id }) => id) as string[],
              },
            },
            create: newCols,
            update: oldCols.map((col) => ({
              where: { id: col.id },
              data: col,
            })),
          },
        },
      });
    } else {
      return await this.prisma.table.create({
        data: {
          ...tableData,
          cols: {
            create: cols,
          },
        },
      });
    }
  }

  async getTables(paginationQueryDto: PaginationQueryDto) {
    return this.prisma.extendsService.table.findManyByPagination(
      paginationQueryDto,
      {
        include: {
          cols: {
            select: {
              id: true,
              name: true,
              colType: true,
            },
          },
        },
      },
    );
  }

  async getTable(id: string) {
    return this.prisma.table.findUnique({
      where: { id },
      include: { cols: true },
    });
  }

  async delTable(id: string) {
    return await this.prisma.table.delete({
      where: {
        id: id,
      },
    });
  }
}
