import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';

/**
 * LLM 消息角色
 */
export type LLMRole = 'user' | 'assistant';

/**
 * LLM 消息格式
 */
export interface LLMMessage {
  role: LLMRole;
  content: string;
}

/**
 * LLM 调用选项
 */
export interface LLMOptions {
  /** 系统提示词 */
  systemPrompt?: string;
  /** 最大 token 数 */
  maxTokens?: number;
  /** 温度参数 */
  temperature?: number;
  /** 模型名称 */
  model?: string;
}

/**
 * LLM 服务
 * 封装 Claude API 调用，支持自定义 API 代理
 */
@Injectable()
export class LLMService {
  private readonly logger = new Logger(LLMService.name);
  private client: Anthropic;
  private defaultModel: string;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const baseURL = process.env.ANTHROPIC_BASE_URL;
    this.defaultModel = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929';

    if (!apiKey) {
      this.logger.warn('ANTHROPIC_API_KEY 未配置，LLM 功能将不可用');
    }

    // 初始化客户端，支持自定义 base URL
    this.client = new Anthropic({
      apiKey: apiKey || '',
      baseURL: baseURL || undefined,
    });

    this.logger.log(`LLM 服务初始化完成，模型: ${this.defaultModel}`);
    if (baseURL) {
      this.logger.log(`使用自定义 API 地址: ${baseURL}`);
    }
  }

  /**
   * 发送消息并获取回复
   */
  async chat(
    messages: LLMMessage[],
    options: LLMOptions = {},
  ): Promise<string> {
    const {
      systemPrompt,
      maxTokens = 2048,
      temperature = 0.7,
      model = this.defaultModel,
    } = options;

    this.logger.log(`调用 LLM: ${model}, 消息数: ${messages.length}`);

    try {
      const response = await this.client.messages.create({
        model,
        max_tokens: maxTokens,
        temperature,
        system: systemPrompt,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      });

      // 提取文本内容
      const textContent = response.content.find(
        (block) => block.type === 'text',
      );
      const result = textContent?.type === 'text' ? textContent.text : '';

      this.logger.log(`LLM 响应完成，token 使用: ${response.usage.output_tokens}`);
      return result;
    } catch (error) {
      this.logger.error(`LLM 调用失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 简单问答（单轮对话）
   */
  async ask(
    question: string,
    systemPrompt?: string,
    options: LLMOptions = {},
  ): Promise<string> {
    return this.chat([{ role: 'user', content: question }], {
      ...options,
      systemPrompt,
    });
  }

  /**
   * 带上下文的问答（RAG 场景）
   */
  async askWithContext(
    question: string,
    context: string,
    systemPrompt?: string,
  ): Promise<string> {
    const prompt = `基于以下上下文信息回答用户问题。如果上下文中没有相关信息，请如实告知。

## 上下文信息
${context}

## 用户问题
${question}`;

    return this.ask(prompt, systemPrompt);
  }
}
