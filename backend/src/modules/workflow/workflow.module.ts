import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workflow } from './entities/workflow.entity';
import { WorkflowController } from './workflow.controller';
import { WorkflowService } from './workflow.service';
import { WorkflowEngine } from './engine';

/**
 * 工作流模块
 */
@Module({
  imports: [TypeOrmModule.forFeature([Workflow])],
  controllers: [WorkflowController],
  providers: [WorkflowService, WorkflowEngine],
  exports: [WorkflowService, WorkflowEngine],
})
export class WorkflowModule {}
