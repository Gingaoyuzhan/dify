import { IsString, IsOptional, IsArray, MaxLength } from 'class-validator';
import {
  WorkflowNode,
  WorkflowEdge,
  WorkflowStatus,
} from '../entities/workflow.entity';

/**
 * 创建工作流 DTO
 */
export class CreateWorkflowDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  nodes?: WorkflowNode[];

  @IsArray()
  @IsOptional()
  edges?: WorkflowEdge[];
}

/**
 * 更新工作流 DTO
 */
export class UpdateWorkflowDto {
  @IsString()
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  nodes?: WorkflowNode[];

  @IsArray()
  @IsOptional()
  edges?: WorkflowEdge[];

  @IsOptional()
  status?: WorkflowStatus;
}

/**
 * 执行工作流 DTO
 */
export class ExecuteWorkflowDto {
  @IsString()
  input: string;
}
