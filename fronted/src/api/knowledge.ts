import { request } from './client';
import type {
  KnowledgeBase,
  KnowledgeDocument,
  CreateKnowledgeBaseDto,
  CreateDocumentDto,
} from '../types';

/**
 * 知识库 API
 */
export const knowledgeApi = {
  // ========== 知识库操作 ==========

  /**
   * 获取所有知识库
   */
  async getAllBases(): Promise<KnowledgeBase[]> {
    return request<KnowledgeBase[]>('get', '/knowledge/bases');
  },

  /**
   * 获取单个知识库
   */
  async getBaseById(id: string): Promise<KnowledgeBase> {
    return request<KnowledgeBase>('get', `/knowledge/bases/${id}`);
  },

  /**
   * 创建知识库
   */
  async createBase(data: CreateKnowledgeBaseDto): Promise<KnowledgeBase> {
    return request<KnowledgeBase>('post', '/knowledge/bases', data);
  },

  /**
   * 更新知识库
   */
  async updateBase(id: string, data: Partial<CreateKnowledgeBaseDto>): Promise<KnowledgeBase> {
    return request<KnowledgeBase>('put', `/knowledge/bases/${id}`, data);
  },

  /**
   * 删除知识库
   */
  async deleteBase(id: string): Promise<void> {
    return request<void>('delete', `/knowledge/bases/${id}`);
  },

  // ========== 文档操作 ==========

  /**
   * 获取知识库的所有文档
   */
  async getDocuments(baseId: string): Promise<KnowledgeDocument[]> {
    return request<KnowledgeDocument[]>('get', `/knowledge/bases/${baseId}/documents`);
  },

  /**
   * 添加文档到知识库
   */
  async addDocument(baseId: string, data: CreateDocumentDto): Promise<KnowledgeDocument> {
    return request<KnowledgeDocument>('post', `/knowledge/bases/${baseId}/documents`, data);
  },

  /**
   * 获取单个文档
   */
  async getDocument(id: string): Promise<KnowledgeDocument> {
    return request<KnowledgeDocument>('get', `/knowledge/documents/${id}`);
  },

  /**
   * 删除文档
   */
  async deleteDocument(id: string): Promise<void> {
    return request<void>('delete', `/knowledge/documents/${id}`);
  },
};
