import {
  ArgumentMetadata,
  Injectable,
  ParseUUIDPipe,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class OptionalUUIDPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const parseUUIDPipe = new ParseUUIDPipe({ version: '4' });
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    return parseUUIDPipe.transform(value, metadata);
  }
}

@Injectable()
export class RequiredUUIDPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const parseUUIDPipe = new ParseUUIDPipe({ version: '4' });
    return parseUUIDPipe.transform(value, metadata);
  }
}
