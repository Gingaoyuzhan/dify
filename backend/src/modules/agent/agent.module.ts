import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatSession } from './entities/chat-session.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { WorkflowModule } from '../workflow/workflow.module';

/**
 * Agent 模块
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([ChatSession, ChatMessage]),
    WorkflowModule,
  ],
  controllers: [AgentController],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentModule {}
