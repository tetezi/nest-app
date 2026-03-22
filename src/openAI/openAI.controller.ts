import {
  Controller,
  Get,
  Header,
  HttpStatus,
  Query,
  Res,
} from '@nestjs/common';
import { OpenAIService } from './openAI.service';
import { ApiTags } from '@nestjs/swagger';
import { type Response } from 'express';
import { createHttpError } from 'src/utils/createHttpError';
import { NoJwtRequired } from 'src/common/guards/jwt.guard';
@ApiTags('openAI')
@Controller('openAI')
export class OpenAIController {
  constructor(private readonly openAIService: OpenAIService) {}
  @Header('Content-Type', 'text/event-stream;charset=utf-8')
  @Header('Transfer-Encoding', 'chunked')
  @Header('Cache-Control', 'no-cache')
  @Header('Connection', 'keep-alive')
  @NoJwtRequired()
  @Get('toolsTest')
  async toolsTest(
    @Res() res: Response,
    @Query() { prompt }: { prompt: string },
  ) {
    if (!prompt) {
      throw createHttpError('prompt 参数不能为空');
    }
    const stream = await this.openAIService.toolsTest(prompt);
    stream?.pipe(res);
    // 监听前端断开连接，关闭流（防止内存泄漏）
    res.on('close', () => {
      stream?.destroy();
      res.end();
    });
  }
  @Header('Content-Type', 'text/event-stream;charset=utf-8')
  @Header('Transfer-Encoding', 'chunked')
  @Header('Cache-Control', 'no-cache')
  @Header('Connection', 'keep-alive')
  @NoJwtRequired()
  @Get('dynamicFormGenerateMDTest')
  async dynamicFormGenerateMDTest(
    @Res() res: Response,
    @Query() { prompt }: { prompt: string },
  ) {
    if (!prompt) {
      throw createHttpError('prompt 参数不能为空');
    }
    const stream = await this.openAIService.dynamicFormGenerateMDTest(prompt);
    stream?.pipe(res);
    // 监听前端断开连接，关闭流（防止内存泄漏）
    res.on('close', () => {
      stream?.destroy();
      res.end();
    });
  }

  @Header('Content-Type', 'text/event-stream;charset=utf-8')
  @Header('Transfer-Encoding', 'chunked')
  @Header('Cache-Control', 'no-cache')
  @Header('Connection', 'keep-alive')
  @NoJwtRequired()
  @Get('dynamicFormGenerateJSONTest')
  async dynamicFormGenerateJSONTest(
    @Res() res: Response,
    @Query() { prompt }: { prompt: string },
  ) {
    if (!prompt) {
      throw createHttpError('prompt 参数不能为空');
    }
    const stream = await this.openAIService.dynamicFormGenerateJSONTest(prompt);
    stream?.pipe(res);
    // 监听前端断开连接，关闭流（防止内存泄漏）
    res.on('close', () => {
      stream?.destroy();
      res.end();
    });
  }
}
