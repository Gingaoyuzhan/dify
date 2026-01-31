import { Module, Global } from '@nestjs/common';
import { LLMService } from './llm.service';

/**
 * LLM 模块
 * 全局模块，提供 LLM 服务
 */
@Global()
@Module({
  providers: [LLMService],
  exports: [LLMService],
})
export class LLMModule {}
