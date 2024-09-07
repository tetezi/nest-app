import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TableService } from '../table/table.service';
import { Col } from '@prisma/client';
import { PaginationQueryType } from 'src/common/types/pagination-query.type';
import { isString } from 'class-validator';
@Injectable()
export class TableRecoredService {
  constructor(
    private prisma: PrismaService,
    private tableService: TableService,
  ) {}
  async getTableConfig(tableId: string) {
    const table = await this.tableService.getTable(tableId);
    if (!table) {
      throw new Error('Table not found');
    } else {
      return table;
    }
  }
  async getTableEntity(tableName: string) {
    const entity = this.prisma.extendsService[tableName];
    if (entity) {
      return entity;
    } else {
      throw new Error('Entity not found');
    }
  }
  async getTableSelectForFind(entity: any, cols: Col[]) {
    const getSelect = async (cols: Col[]) => {
      const reuslt = {
        id: true,
      };

      for (const col of cols) {
        const { name, colType, subTableType, canQuery, subTableQueryStrategy } =
          col;
        if (canQuery) {
          if (col.colType === 'SubTable') {
            const subTable = await this.tableService.getTable(
              col.subTableId as string,
            );
            if (subTable) {
              if (subTableQueryStrategy === 'PartialObject') {
                //TODO: 实现部分对象查询策略
                reuslt[col.name] = {
                  select: await getSelect(subTable.cols),
                };
              } else if (subTableQueryStrategy === 'FullObject') {
                reuslt[col.name] = {
                  select: await getSelect(subTable.cols),
                };
              }
            } else {
              throw new Error(`<${col.name}> SubTable not found`);
            }
          } else {
            reuslt[col.name] = true;
          }
        }
      }
      return reuslt;
    };
    return await getSelect(cols);
  }
  async getTableSelectSubsetForSave(cols: Col[], data: any) {
    const { id } = data;
    const isUpdate = id !== undefined;
    const result: any = {
      id,
    };
    for (const col of cols) {
      const {
        name,
        colType,
        subTableType,
        canWritable,
        subTableWritableStrategy,
      } = col;
      if (canWritable) {
        const value = data[name];
        if (colType === 'SubTable') {
          if (value === null) {
            if (isUpdate) {
              if (subTableType === 'ToMany') {
                result[col.name] = { set: [] };
              } else if (subTableType === 'ToOne') {
                result[col.name] = { disconnect: true };
              }
            }
          } else {
            if (subTableWritableStrategy === 'ConnectById') {
              if (subTableType === 'ToOne') {
                result[col.name] = {
                  connect: { id: isString(value) ? value : value.id },
                };
              } else if (subTableType === 'ToMany') {
                if (isUpdate) {
                  result[col.name] = {
                    set: [],
                    connect: value.map((v) => ({
                      id: isString(v) ? v : v.id,
                    })),
                  };
                } else {
                  result[col.name] = {
                    connect: value.map((v) => ({
                      id: isString(v) ? v : v.id,
                    })),
                  };
                }
              }
            } else if (subTableWritableStrategy === 'UpsertByObject') {
              const { cols: subCols } = await this.getTableConfig(
                col.subTableId as string,
              );

              if (subTableType === 'ToOne') {
                const subSelectSubset = await this.getTableSelectSubsetForSave(
                  subCols,
                  value,
                );
                if (isUpdate) {
                  result[col.name] = {
                    upsert: {
                      create: subSelectSubset,
                      update: subSelectSubset,
                    },
                  };
                } else {
                  result[col.name] = {
                    create: subSelectSubset,
                  };
                }
              } else if (subTableType === 'ToMany') {
                const subSelectSubset = await Promise.all(
                  value.map((row) =>
                    this.getTableSelectSubsetForSave(subCols, row),
                  ),
                );
                if (isUpdate) {
                  result[col.name] = {
                    set: subSelectSubset.filter(({ id }) => id),
                    create: subSelectSubset.filter(({ id }) => !id),
                  };
                } else {
                  result[col.name] = {
                    create: subSelectSubset,
                  };
                }
              }
            }
          }
        } else {
          if (value === undefined || value === null) {
            if (isUpdate) {
              result[col.name] = null;
            }
          } else {
            if (colType === 'String') {
              result[col.name] = String(value);
            } else if (colType === 'Boolean') {
              result[col.name] = Boolean(value);
            } else if (colType === 'DateTime') {
              result[col.name] = new Date(value).toISOString();
            } else if (colType === 'Int') {
              result[col.name] = Number(value);
            }
          }
        }
      }

      /////////////////////////////////////////////////////////

      // this.prisma.menu.create({
      //   data: {
      //     name: '',
      //     type: 'Group',
      //     //parentMenu: { a: '' }, 对一 create connectOrCreate connect
      //     // subMenus: { a: '' }, 对多 create connectOrCreate connect createMany
      //   },
      // });
      // this.prisma.menu.update({
      //   where: { id: '' },
      //   data: {
      //     name: '',
      //     type: 'Group',
      //     //parentMenu: { a: '' }, 对一 create connectOrCreate upsert disconnect delete connect update,
      //     // subMenus: { a: '' }, //对多 create connectOrCreate upsert createMany set disconnect delete connect update updateMany deleteMany
      //   },
      // });
      // this.prisma.menu.update({
      //   where: { id: '' },
      //   data: {
      //     name: '',
      //     type: 'Group',
      //     subMenus: {
      //       set: [{ name: '' }],
      //     },
      //   },
      // });
    }
    return result;
  }
  async saveTableRecored(tableId: string, recoredData: { id?: string }) {
    const { id } = recoredData;
    const { tableName, cols } = await this.getTableConfig(tableId);
    const entity = await this.getTableEntity(tableName);
    const data = await this.getTableSelectSubsetForSave(cols, recoredData);
    console.log({
      转换前参数: recoredData,
      转换后参数: data,
    });
    if (id) {
      return entity.update({
        where: { id },
        data,
      });
    } else {
      return entity.create({
        data: data,
      });
    }
  }

  async getTableRecored(tableId: string, recoredId: string) {
    const { tableName, cols } = await this.getTableConfig(tableId);
    const entity = await this.getTableEntity(tableName);
    const select = await this.getTableSelectForFind(entity, cols);
    this.prisma.extraWorkApplication.findUniqueOrThrow({
      where: { id: recoredId },
      select: {
        userId: true,
      },
    });
    return await entity.findUniqueOrThrow({
      where: { id: recoredId },
      select: select,
    });
  }

  async getTableRecoreds(tableId: string, pageQuery: PaginationQueryType) {
    const { tableName, cols } = await this.getTableConfig(tableId);
    const entity = await this.getTableEntity(tableName);
    const select = await this.getTableSelectForFind(entity, cols);
    console.log({
      select,
    });
    return await entity.findManyByPagination(pageQuery, {
      select: select,
    });
  }
  async delTableRecored(tableId: string, recoredId: string) {
    // this.prisma.col.create({
    //   data: {
    //     name: '',
    //     colType: 'String',
    //     tableId: '',
    //     subTable: {
    //       connect: { id: 'sdad ' },
    //     },
    //   },
    // });
    const { tableName } = await this.getTableConfig(tableId);
    const entity = await this.getTableEntity(tableName);
    return await entity.delete({ where: { id: recoredId } });
  }
}
