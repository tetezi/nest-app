import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TableService } from '../table/table.service';
import { DynamicCol, DynamicTable } from '@prisma/client';
import { PaginationQueryType } from 'src/common/types/pagination-query.type';
import { isArray, isString } from 'class-validator';
import { EnumService } from 'src/enum/enum.service';
import { set, get, isPlainObject } from 'lodash';
@Injectable()
export class TableRecoredService {
  constructor(
    private prisma: PrismaService,
    private enumsService: EnumService,
    private tableService: TableService,
  ) {}
  async getTableConfig(tableIdOrName: string) {
    const table = await this.tableService.getTable(tableIdOrName);
    if (!table) {
      throw new Error('DynamicTable not found');
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
  async getTableSelectForFind(cols: DynamicCol[]) {
    const getSelect = async (cols: DynamicCol[]) => {
      const reuslt = {
        id: true,
      };

      for (const col of cols) {
        const { name, colType, canQuery, subTableQueryStrategy } = col;
        if (canQuery) {
          if (colType === 'SubTable') {
            const subTable = await this.getTableConfig(
              col.subTableId as string,
            );
            if (subTable) {
              if (subTableQueryStrategy === 'PartialObject') {
                //TODO: 实现部分对象查询策略
                reuslt[name] = {
                  select: await getSelect(subTable.cols),
                };
              } else if (subTableQueryStrategy === 'FullObject') {
                reuslt[name] = {
                  select: await getSelect(subTable.cols),
                };
              }
            } else {
              throw new Error(`<${name}> SubTable not found`);
            }
          } else {
            reuslt[name] = true;
          }
        }
      }
      return reuslt;
    };
    return await getSelect(cols);
  }
  async getTableSelectSubsetForSave(cols: DynamicCol[], data: any) {
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
        enumCategoryId,
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
            } else if (colType === 'Enum') {
              if (!enumCategoryId) {
                throw new Error(
                  `当前数据表未正确配置字段：[${name}]的枚举类型`,
                );
              }
              const enumDetail = await this.enumsService.checkEnum(
                enumCategoryId,
                value,
              );
              result[col.name] = enumDetail.value;
            }
          }
        }
      }
    }
    return result;
  }
  async saveTableRecored(tableIdOrName: string, recoredData: { id?: string }) {
    const { id } = recoredData;
    const { tableName, cols } = await this.getTableConfig(tableIdOrName);
    const entity = await this.getTableEntity(tableName);
    const data = await this.getTableSelectSubsetForSave(cols, recoredData);

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
  getSelect(cols) {
    const select = { id: true };
    for (const col of cols) {
      if (col.canQuery) {
        if (col.colType === 'SubTable') {
          select[col.name] = {
            select: { id: true },
          };
        } else {
          select[col.name] = true;
        }
      }
    }
    return select;
  }
  async getTableRecoredTest(
    recoredId: string,
    tableMap: Map<string, any>,
    tableIdOrName: string,
  ) {
    let tableConfig: DynamicTable & { cols: DynamicCol[] };
    if (tableMap.has(tableIdOrName)) {
      tableConfig = tableMap.get(tableIdOrName);
    } else {
      tableConfig = await this.getTableConfig(tableIdOrName);
      tableMap.set(tableIdOrName, tableConfig);
    }
    const entity = await this.getTableEntity(tableConfig.tableName);
    const rawData = await entity.findUniqueOrThrow({
      where: { id: recoredId },
      select: this.getSelect(tableConfig.cols),
    });
    return await this.rawDataTransition(rawData, tableMap, tableIdOrName);
  }
  async rawDataTransition(
    rawData,
    tableMap: Map<string, any>,
    tableIdOrName: string,
  ) {
    let tableConfig: DynamicTable & { cols: DynamicCol[] };
    if (tableMap.has(tableIdOrName)) {
      tableConfig = tableMap.get(tableIdOrName);
    } else {
      tableConfig = await this.getTableConfig(tableIdOrName);
      tableMap.set(tableIdOrName, tableConfig);
    }
    const queryCols = tableConfig.cols.filter((col) => col.canQuery);
    const result = {
      id: rawData.id,
    };
    for (const col of queryCols) {
      const { name, colType, subTableType, fission } = col;
      let val = rawData[name];
      const subTableId = col.subTableId as string;
      if (colType === 'SubTable') {
        if (subTableType === 'ToOne') {
          const subData = await this.getTableRecoredTest(
            val.id,
            tableMap,
            subTableId,
          );
          val = await this.rawDataTransition(subData, tableMap, subTableId);
        } else if (subTableType === 'ToMany') {
          for (const index in val) {
            const row = await this.getTableRecoredTest(
              val[index].id,
              tableMap,
              subTableId,
            );
            val[index] = await this.rawDataTransition(
              row,
              tableMap,
              subTableId,
            );
          }
        }
      } else if (colType === 'Enum') {
      } else {
      }

      /**
       * TODO: 实现数据转换
       */
      // if (col.transform) {
      //   val = col.transform(val);
      // }
      result[name] = val;
      if (isArray(fission)) {
        if (colType === 'SubTable') {
          (fission as any[]).forEach(({ formKey, toKey }) => {
            const fissionValue = isArray(val)
              ? val.map((v) => get(v, formKey))
              : isPlainObject(val)
              ? get(val, formKey)
              : undefined;
            set(result, toKey, fissionValue);
          });
        } else if (colType === 'Enum') {
          const enumDetail = await this.enumsService.checkEnum(
            col.enumCategoryId,
            val,
          );
          (fission as any[]).forEach(({ formKey, toKey }) => {
            const fissionValue = get(enumDetail, formKey);
            set(result, toKey, fissionValue);
          });
        }
      }
    }
    return result;
  }
  async getTableRecored(tableIdOrName: string, recoredId: string) {
    const test = true;

    if (test) {
      const map = new Map();
      return await this.getTableRecoredTest(recoredId, map, tableIdOrName);
    } else {
      const { tableName, cols } = await this.getTableConfig(tableIdOrName);
      const entity = await this.getTableEntity(tableName);
      const select = await this.getTableSelectForFind(cols);
      return await entity.findUniqueOrThrow({
        where: { id: recoredId },
        select: select,
      });
    }
  }

  async getTableRecoreds(
    tableIdOrName: string,
    pageQuery: PaginationQueryType,
  ) {
    const test = true;

    if (test) {
      const config = await this.getTableConfig(tableIdOrName);
      const map = new Map([[tableIdOrName, config]]);
      const entity = await this.getTableEntity(config.tableName);

      const data = await entity.findManyByPagination(pageQuery, {
        select: this.getSelect(config.cols),
        orderBy: {
          createdAt:
            'createdAt' in this.prisma.dynamicForm.fields ? 'desc' : undefined,
        },
      });
      const rows = pageQuery ? data.rows : data;
      const total = pageQuery ? data.total : data.length;
      for (const index in rows) {
        rows[index] = await this.rawDataTransition(
          rows[index],
          map,
          tableIdOrName,
        );
      }
      if (pageQuery) {
        return {
          total: total,
          rows: rows,
        };
      } else {
        return rows;
      }
    } else {
      const { tableName, cols } = await this.getTableConfig(tableIdOrName);
      const entity = await this.getTableEntity(tableName);
      const select = await this.getTableSelectForFind(cols);

      return await entity.findManyByPagination(pageQuery, {
        select: select,
      });
    }
  }
  async delTableRecored(tableIdOrName: string, recoredId: string) {
    const { tableName } = await this.getTableConfig(tableIdOrName);
    const entity = await this.getTableEntity(tableName);
    return await entity.delete({ where: { id: recoredId } });
  }
}
