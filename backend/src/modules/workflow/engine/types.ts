/**
 * 工作流引擎类型定义
 */

/**
 * 节点类型
 * 与前端 Vue Flow 节点类型对应
 */
export type NodeType = 'start' | 'llm' | 'knowledge' | 'end';

/**
 * 节点执行状态
 */
export enum NodeExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
}

/**
 * 工作流节点定义
 */
export interface WorkflowNodeDef {
  id: string;
  type: NodeType;
  label: string;
  position: { x: number; y: number };
  data: {
    label?: string;
    description?: string;
    /** LLM 节点配置 */
    systemPrompt?: string;
    model?: string;
    temperature?: number;
    /** 知识库节点配置 */
    knowledgeBaseId?: string;
    topK?: number;
    /** 其他自定义配置 */
    [key: string]: unknown;
  };
}

/**
 * 工作流连线定义
 */
export interface WorkflowEdgeDef {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

/**
 * 节点执行结果
 */
export interface NodeExecutionResult {
  nodeId: string;
  nodeType: NodeType;
  status: NodeExecutionStatus;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  error?: string;
  startTime: number;
  endTime: number;
}

/**
 * 工作流执行上下文
 */
export interface WorkflowContext {
  /** 工作流 ID */
  workflowId: string;
  /** 执行 ID */
  executionId: string;
  /** 用户输入 */
  userInput: string;
  /** 变量存储 */
  variables: Record<string, unknown>;
  /** 节点执行结果 */
  nodeResults: Map<string, NodeExecutionResult>;
  /** 最终输出 */
  finalOutput?: string;
}

/**
 * 工作流执行结果
 */
export interface WorkflowExecutionResult {
  executionId: string;
  workflowId: string;
  status: 'completed' | 'failed';
  output: string;
  nodeResults: NodeExecutionResult[];
  error?: string;
  startTime: number;
  endTime: number;
}
