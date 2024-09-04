import {
  ArgumentMetadata,
  Injectable,
  ParseUUIDPipe,
  PipeTransform,
} from '@nestjs/common';
import { isPlainObject } from 'lodash';

@Injectable()
export class PaginationQueryPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (isPlainObject(value)) {
      const { pageIndex, pageSize } = value;
      if (pageIndex || pageSize) {
        return {
          pageIndex: Number(pageIndex || 1),
          pageSize: Number(pageSize || 10),
        };
      }
    }
    return undefined;
  }
}
