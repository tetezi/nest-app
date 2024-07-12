import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    console.time('Request');
    console.log(`Request: ${req.method} ${req.url}`);
    res.on('finish', () => {
      console.timeEnd('Request');
    });
    next();
  }
}
