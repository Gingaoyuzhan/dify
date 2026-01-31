import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { LLMModule } from './modules/llm/llm.module';
import { RAGModule } from './modules/rag/rag.module';
import { WorkflowModule } from './modules/workflow/workflow.module';
import { KnowledgeModule } from './modules/knowledge/knowledge.module';
import { AgentModule } from './modules/agent/agent.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

/**
 * 应用根模块
 */
@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // 数据库模块
    TypeOrmModule.forRoot(databaseConfig()),
    // 全局服务模块
    LLMModule,
    RAGModule,
    // 业务模块
    WorkflowModule,
    KnowledgeModule,
    AgentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
