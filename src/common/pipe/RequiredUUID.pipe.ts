import {
  ArgumentMetadata,
  Injectable,
  ParseUUIDPipe,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class RequiredUUIDPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const parseUUIDPipe = new ParseUUIDPipe({ version: '4' });
    return parseUUIDPipe.transform(value, metadata);
  }
}
