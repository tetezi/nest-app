import { Prisma } from '@prisma/client';
import { omit } from 'lodash';
import { PaginationQueryType } from 'src/common/types/pagination-query.type';
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
            page?: PaginationQueryType,
            args?: Prisma.Args<T, 'findMany'>,
          ) {
            const context = Prisma.getExtensionContext(this);
            if (page) {
              const { pageIndex = 1, pageSize = 10 } = page;
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
            } else {
              return await (context as any).findMany(args);
            }
          },
        },
      },
    });
});
