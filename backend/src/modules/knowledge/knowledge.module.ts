import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KnowledgeBase } from './entities/knowledge-base.entity';
import { KnowledgeDocument } from './entities/knowledge-document.entity';
import { KnowledgeController } from './knowledge.controller';
import { KnowledgeService } from './knowledge.service';

/**
 * 知识库模块
 */
@Module({
  imports: [TypeOrmModule.forFeature([KnowledgeBase, KnowledgeDocument])],
  controllers: [KnowledgeController],
  providers: [KnowledgeService],
  exports: [KnowledgeService],
})
export class KnowledgeModule {}
