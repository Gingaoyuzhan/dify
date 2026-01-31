/**
 * 前端类型定义
 * 与后端 API 对应
 */

// ========== 通用类型 ==========

/** API 响应格式 */
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

// ========== 工作流类型 ==========

/** 工作流状态 */
export type WorkflowStatus = 'draft' | 'published' | 'archived';

/** 节点类型 */
export type NodeType = 'start' | 'llm' | 'knowledge' | 'end';

/** 工作流节点 */
export interface WorkflowNode {
  id: string;
  type: NodeType;
  label: string;
  position: { x: number; y: number };
  data: {
    label?: string;
    description?: string;
    systemPrompt?: string;
    model?: string;
    temperature?: number;
    knowledgeBaseId?: string;
    topK?: number;
    [key: string]: unknown;
  };
}

/** 工作流连线 */
export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

/** 工作流 */
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  status: WorkflowStatus;
  createdAt: string;
  updatedAt: string;
}

/** 创建工作流请求 */
export interface CreateWorkflowDto {
  name: string;
  description?: string;
  nodes?: WorkflowNode[];
  edges?: WorkflowEdge[];
}

/** 更新工作流请求 */
export interface UpdateWorkflowDto {
  name?: string;
  description?: string;
  nodes?: WorkflowNode[];
  edges?: WorkflowEdge[];
  status?: WorkflowStatus;
}

/** 执行工作流请求 */
export interface ExecuteWorkflowDto {
  input: string;
}

/** 节点执行状态 */
export type NodeExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

/** 节点执行结果 */
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

/** 工作流执行结果 */
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

// ========== 知识库类型 ==========

/** 知识库 */
export interface KnowledgeBase {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

/** 知识文档 */
export interface KnowledgeDocument {
  id: string;
  knowledgeBaseId: string;
  title: string;
  content: string;
  source?: string;
  createdAt: string;
}

/** 创建知识库请求 */
export interface CreateKnowledgeBaseDto {
  name: string;
  description?: string;
}

/** 创建文档请求 */
export interface CreateDocumentDto {
  title: string;
  content: string;
  source?: string;
}

// ========== Agent 类型 ==========

/** 消息角色 */
export type MessageRole = 'user' | 'assistant' | 'system';

/** 消息来源 */
export interface MessageSource {
  type: 'knowledge' | 'workflow';
  id: string;
  title: string;
  content?: string;
}

/** 聊天消息 */
export interface ChatMessage {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  sources?: MessageSource[];
  createdAt: string;
}

/** 聊天会话 */
export interface ChatSession {
  id: string;
  workflowId?: string;
  title?: string;
  messages?: ChatMessage[];
  createdAt: string;
}

/** 创建会话请求 */
export interface CreateSessionDto {
  workflowId?: string;
  title?: string;
}

/** 发送消息请求 */
export interface SendMessageDto {
  content: string;
}

/** 聊天响应 */
export interface ChatResponse {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
}
