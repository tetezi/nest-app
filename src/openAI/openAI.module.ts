import { Global, Module } from '@nestjs/common';
import { OpenAIService } from './openAI.service';
import { OpenAIController } from './openAI.controller';
@Global()
@Module({
  controllers: [OpenAIController],
  providers: [OpenAIService],
  exports: [OpenAIService], // 导出服务，允许其他模块导入使用
})
export class OpenAIModule {}
