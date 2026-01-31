import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatSession } from './entities/chat-session.entity';
import { ChatMessage, MessageRole, MessageSource } from './entities/chat-message.entity';
import { CreateSessionDto, SendMessageDto } from './dto';
import { LLMService, LLMMessage } from '../llm/llm.service';
import { RAGService, RetrievalResult } from '../rag/rag.service';
import { WorkflowService } from '../workflow/workflow.service';

/**
 * 聊天响应结果
 */
export interface ChatResponse {
  /** 用户消息 */
  userMessage: ChatMessage;
  /** AI 回复消息 */
  assistantMessage: ChatMessage;
}

/**
 * Agent 服务
 * 处理对话会话和消息管理，整合工作流、RAG 和 LLM
 */
@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);

  constructor(
    @InjectRepository(ChatSession)
    private readonly sessionRepository: Repository<ChatSession>,
    @InjectRepository(ChatMessage)
    private readonly messageRepository: Repository<ChatMessage>,
    private readonly llmService: LLMService,
    private readonly ragService: RAGService,
    private readonly workflowService: WorkflowService,
  ) {}

  // ========== 会话操作 ==========

  /**
   * 创建对话会话
   */
  async createSession(dto: CreateSessionDto): Promise<ChatSession> {
    const session = this.sessionRepository.create({
      workflowId: dto.workflowId,
      title: dto.title,
    });

    const saved = await this.sessionRepository.save(session);
    this.logger.log(`创建会话: ${saved.id}`);
    return saved;
  }

  /**
   * 获取所有会话
   */
  async findAllSessions(): Promise<ChatSession[]> {
    return this.sessionRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 获取单个会话（包含消息）
   */
  async findSession(id: string): Promise<ChatSession> {
    const session = await this.sessionRepository.findOne({
      where: { id },
      relations: ['messages'],
    });
    if (!session) {
      throw new NotFoundException(`会话不存在: ${id}`);
    }
    // 按时间排序消息
    if (session.messages) {
      session.messages.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
      );
    }
    return session;
  }

  /**
   * 删除会话
   */
  async removeSession(id: string): Promise<void> {
    const session = await this.findSession(id);
    await this.sessionRepository.remove(session);
    this.logger.log(`删除会话: ${id}`);
  }

  // ========== 消息操作 ==========

  /**
   * 发送消息并获取 AI 回复
   * 整合工作流执行、RAG 检索和 LLM 调用
   */
  async chat(sessionId: string, dto: SendMessageDto): Promise<ChatResponse> {
    const session = await this.findSession(sessionId);

    // 保存用户消息
    const userMessage = this.messageRepository.create({
      sessionId,
      role: MessageRole.USER,
      content: dto.content,
    });
    await this.messageRepository.save(userMessage);
    this.logger.log(`用户消息: ${userMessage.id}`);

    let assistantContent: string;
    let sources: MessageSource[] = [];

    // 如果会话关联了工作流，执行工作流
    if (session.workflowId) {
      this.logger.log(`执行关联工作流: ${session.workflowId}`);
      const result = await this.workflowService.execute(
        session.workflowId,
        dto.content,
      );

      if (result.status === 'completed') {
        assistantContent = result.output;

        // 从工作流结果中提取来源
        for (const nodeResult of result.nodeResults) {
          if (nodeResult.nodeType === 'knowledge' && nodeResult.output) {
            const knowledgeResults = nodeResult.output['results'] as RetrievalResult[];
            if (knowledgeResults) {
              sources.push(
                ...knowledgeResults.map((r) => ({
                  type: 'knowledge' as const,
                  id: r.documentId,
                  title: r.title,
                  content: r.content,
                })),
              );
            }
          }
        }
      } else {
        assistantContent = `工作流执行失败: ${result.error || '未知错误'}`;
      }
    } else {
      // 没有工作流，直接使用 LLM 对话
      // 获取历史消息构建上下文
      const historyMessages = await this.getConversationHistory(sessionId);

      const systemPrompt = `你是一个智能助手，请友好、准确地回答用户的问题。`;

      assistantContent = await this.llmService.chat(
        [...historyMessages, { role: 'user', content: dto.content }],
        { systemPrompt },
      );
    }

    // 保存 AI 回复
    const assistantMessage = this.messageRepository.create({
      sessionId,
      role: MessageRole.ASSISTANT,
      content: assistantContent,
      sources: sources.length > 0 ? sources : undefined,
    });
    await this.messageRepository.save(assistantMessage);
    this.logger.log(`AI 回复: ${assistantMessage.id}`);

    return { userMessage, assistantMessage };
  }

  /**
   * 发送消息（仅保存，不生成回复）
   * 用于需要手动控制回复生成的场景
   */
  async sendMessage(
    sessionId: string,
    dto: SendMessageDto,
  ): Promise<ChatMessage> {
    await this.findSession(sessionId);

    const message = this.messageRepository.create({
      sessionId,
      role: MessageRole.USER,
      content: dto.content,
    });

    const saved = await this.messageRepository.save(message);
    this.logger.log(`用户消息: ${saved.id} in session ${sessionId}`);
    return saved;
  }

  /**
   * 保存 AI 回复消息
   */
  async saveAssistantMessage(
    sessionId: string,
    content: string,
    sources?: ChatMessage['sources'],
  ): Promise<ChatMessage> {
    const message = this.messageRepository.create({
      sessionId,
      role: MessageRole.ASSISTANT,
      content,
      sources,
    });

    const saved = await this.messageRepository.save(message);
    this.logger.log(`AI 回复: ${saved.id} in session ${sessionId}`);
    return saved;
  }

  /**
   * 获取会话的所有消息
   */
  async findMessages(sessionId: string): Promise<ChatMessage[]> {
    return this.messageRepository.find({
      where: { sessionId },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * 获取对话历史（用于构建 LLM 上下文）
   */
  private async getConversationHistory(
    sessionId: string,
    maxMessages = 10,
  ): Promise<LLMMessage[]> {
    const messages = await this.messageRepository.find({
      where: { sessionId },
      order: { createdAt: 'DESC' },
      take: maxMessages,
    });

    // 反转顺序（从旧到新）
    messages.reverse();

    return messages
      .filter((m) => m.role !== MessageRole.SYSTEM)
      .map((m) => ({
        role: m.role === MessageRole.USER ? 'user' : 'assistant',
        content: m.content,
      })) as LLMMessage[];
  }
}
