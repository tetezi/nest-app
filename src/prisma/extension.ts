import { Prisma } from '@prisma/client';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { omit } from 'lodash';
export const defineExtension = Prisma.defineExtension((client) => {
  return client
    .$extends({
      name: 'softDelete',
      model: {
        $allModels: {
          async softDelete<T>(
            this: T,
            where: Prisma.Args<T, 'update'>['where'],
          ): Promise<unknown> {
            const context = Prisma.getExtensionContext(this);

            return (context as any).update({
              where,
              data: { deletedAt: new Date() },
            });
          },
        },
      },
    })
    .$extends({
      model: {
        $allModels: {
          async findManyByPagination<T>(
            this: T,
            page: PaginationQueryDto,
            args?: Prisma.Args<T, 'findMany'>,
          ) {
            const { pageIndex = 1, pageSize = 10 } = page;
            const context = Prisma.getExtensionContext(this);
            const rows = await (context as any).findMany({
              ...args,
              skip: (pageIndex - 1) * pageSize,
              take: pageSize,
            });
            const total = await (context as any).count({
              ...omit(args, ['select', 'include']),
            });
            return {
              rows,
              total,
            };
          },
        },
      },
    });
});
