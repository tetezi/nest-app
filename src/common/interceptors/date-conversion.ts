import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isArray, isPlainObject, isDate } from 'lodash';
import * as dayjs from 'dayjs';
// 递归地解析输入中的所有 Promise 对象
function deepDateConversion(input) {
  // 如果输入是数组，则递归解析数组中的每个元素
  if (isArray(input)) {
    return input.map(deepDateConversion);
  }
  // 如果输入是对象，则递归解析对象中的每个元素
  else if (isPlainObject(input)) {
    const result = {};
    Object.keys(input).forEach((key) => {
      result[key] = deepDateConversion(input[key]);
    });
    return result;
  } else if (isDate(input)) {
    return dayjs(input).format('YYYY-MM-DD HH:mm:ss');
  } else {
    return input;
  }
}

@Injectable()
//  用于解析数据中的Promise的拦截器
export class DateConversionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data) => {
        return deepDateConversion(data);
      }),
    );
  }
}
