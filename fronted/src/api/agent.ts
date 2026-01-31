import { request } from './client';
import type {
  ChatSession,
  ChatMessage,
  CreateSessionDto,
  SendMessageDto,
  ChatResponse,
} from '../types';

/**
 * Agent API
 */
export const agentApi = {
  // ========== 会话操作 ==========

  /**
   * 获取所有会话
   */
  async getAllSessions(): Promise<ChatSession[]> {
    return request<ChatSession[]>('get', '/agent/sessions');
  },

  /**
   * 获取单个会话（包含消息）
   */
  async getSession(id: string): Promise<ChatSession> {
    return request<ChatSession>('get', `/agent/sessions/${id}`);
  },

  /**
   * 创建会话
   */
  async createSession(data: CreateSessionDto = {}): Promise<ChatSession> {
    return request<ChatSession>('post', '/agent/sessions', data);
  },

  /**
   * 删除会话
   */
  async deleteSession(id: string): Promise<void> {
    return request<void>('delete', `/agent/sessions/${id}`);
  },

  // ========== 消息操作 ==========

  /**
   * 发送消息并获取 AI 回复
   */
  async chat(sessionId: string, data: SendMessageDto): Promise<ChatResponse> {
    return request<ChatResponse>('post', `/agent/sessions/${sessionId}/chat`, data);
  },

  /**
   * 获取会话的所有消息
   */
  async getMessages(sessionId: string): Promise<ChatMessage[]> {
    return request<ChatMessage[]>('get', `/agent/sessions/${sessionId}/messages`);
  },
};
