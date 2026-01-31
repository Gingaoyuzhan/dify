import { request } from './client';
import type {
  Workflow,
  CreateWorkflowDto,
  UpdateWorkflowDto,
  ExecuteWorkflowDto,
  WorkflowExecutionResult,
} from '../types';

/**
 * 工作流 API
 */
export const workflowApi = {
  /**
   * 获取所有工作流
   */
  async getAll(): Promise<Workflow[]> {
    return request<Workflow[]>('get', '/workflows');
  },

  /**
   * 获取单个工作流
   */
  async getById(id: string): Promise<Workflow> {
    return request<Workflow>('get', `/workflows/${id}`);
  },

  /**
   * 创建工作流
   */
  async create(data: CreateWorkflowDto): Promise<Workflow> {
    return request<Workflow>('post', '/workflows', data);
  },

  /**
   * 更新工作流
   */
  async update(id: string, data: UpdateWorkflowDto): Promise<Workflow> {
    return request<Workflow>('put', `/workflows/${id}`, data);
  },

  /**
   * 删除工作流
   */
  async delete(id: string): Promise<void> {
    return request<void>('delete', `/workflows/${id}`);
  },

  /**
   * 执行工作流
   */
  async execute(id: string, data: ExecuteWorkflowDto): Promise<WorkflowExecutionResult> {
    return request<WorkflowExecutionResult>('post', `/workflows/${id}/execute`, data);
  },
};
