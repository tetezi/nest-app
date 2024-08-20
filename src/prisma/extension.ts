import { Prisma } from '@prisma/client';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

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
            args: Prisma.Args<T, 'findMany'> & PaginationQueryDto,
          ) {
            const { pageIndex = 1, pageSize = 10, ...rest } = args;
            const context = Prisma.getExtensionContext(this);
            const rows = await (this as any).findMany({
              ...rest,
              skip: (pageIndex - 1) * pageSize,
              take: pageSize,
            });
            const total = await (context as any).count(rest);
            return {
              rows,
              total,
            };
          },
        },
      },
    });
});
