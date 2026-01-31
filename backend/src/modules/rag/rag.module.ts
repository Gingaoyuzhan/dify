import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KnowledgeDocument } from '../knowledge/entities/knowledge-document.entity';
import { RAGService } from './rag.service';

/**
 * RAG 模块
 * 全局模块，提供检索增强生成服务
 */
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([KnowledgeDocument])],
  providers: [RAGService],
  exports: [RAGService],
})
export class RAGModule {}
