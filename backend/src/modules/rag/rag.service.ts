import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KnowledgeDocument } from '../knowledge/entities/knowledge-document.entity';
import { LLMService } from '../llm/llm.service';

/**
 * 检索结果
 */
export interface RetrievalResult {
  /** 文档 ID */
  documentId: string;
  /** 文档标题 */
  title: string;
  /** 匹配的内容 */
  content: string;
  /** 相关性分数 */
  score: number;
  /** 来源 */
  source?: string;
}

/**
 * RAG 服务
 * 实现文档检索和上下文增强
 *
 * 注意：当前使用简化的关键词检索实现
 * 生产环境建议使用向量检索（pgvector）
 */
@Injectable()
export class RAGService {
  private readonly logger = new Logger(RAGService.name);

  constructor(
    @InjectRepository(KnowledgeDocument)
    private readonly documentRepository: Repository<KnowledgeDocument>,
    private readonly llmService: LLMService,
  ) {}

  /**
   * 检索相关文档
   * 使用关键词匹配 + 简单相关性排序
   */
  async retrieve(
    query: string,
    knowledgeBaseId?: string,
    topK = 3,
  ): Promise<RetrievalResult[]> {
    this.logger.log(`检索查询: "${query}", 知识库: ${knowledgeBaseId || '全部'}`);

    // 构建查询条件
    const queryBuilder = this.documentRepository.createQueryBuilder('doc');

    if (knowledgeBaseId) {
      queryBuilder.where('doc.knowledge_base_id = :kbId', {
        kbId: knowledgeBaseId,
      });
    }

    const documents = await queryBuilder.getMany();

    if (documents.length === 0) {
      this.logger.log('未找到任何文档');
      return [];
    }

    // 关键词提取和匹配
    const keywords = this.extractKeywords(query);
    const results: RetrievalResult[] = [];

    for (const doc of documents) {
      const score = this.calculateRelevance(doc.content, keywords);
      if (score > 0) {
        results.push({
          documentId: doc.id,
          title: doc.title,
          content: this.extractRelevantSnippet(doc.content, keywords),
          score,
          source: doc.source,
        });
      }
    }

    // 按相关性排序并返回 topK
    results.sort((a, b) => b.score - a.score);
    const topResults = results.slice(0, topK);

    this.logger.log(`检索完成，找到 ${topResults.length} 个相关文档`);
    return topResults;
  }

  /**
   * 生成带上下文的回答
   */
  async generateAnswer(
    query: string,
    knowledgeBaseId?: string,
  ): Promise<{ answer: string; sources: RetrievalResult[] }> {
    // 检索相关文档
    const sources = await this.retrieve(query, knowledgeBaseId);

    if (sources.length === 0) {
      return {
        answer: '抱歉，我在知识库中没有找到相关信息来回答您的问题。',
        sources: [],
      };
    }

    // 构建上下文
    const context = sources
      .map((s, i) => `[${i + 1}] ${s.title}\n${s.content}`)
      .join('\n\n');

    // 调用 LLM 生成回答
    const systemPrompt = `你是一个智能助手，基于提供的知识库内容回答用户问题。
请遵循以下规则：
1. 只基于提供的上下文信息回答
2. 如果上下文中没有相关信息，请如实告知
3. 回答要简洁准确
4. 可以引用来源编号，如 [1]、[2]`;

    const answer = await this.llmService.askWithContext(
      query,
      context,
      systemPrompt,
    );

    return { answer, sources };
  }

  /**
   * 提取关键词
   */
  private extractKeywords(text: string): string[] {
    // 简单的关键词提取：分词 + 去除停用词
    const stopWords = new Set([
      '的',
      '是',
      '在',
      '了',
      '和',
      '与',
      '或',
      '有',
      '这',
      '那',
      '什么',
      '怎么',
      '如何',
      '为什么',
      'the',
      'a',
      'an',
      'is',
      'are',
      'was',
      'were',
      'be',
      'been',
      'being',
      'have',
      'has',
      'had',
      'do',
      'does',
      'did',
      'will',
      'would',
      'could',
      'should',
      'may',
      'might',
      'must',
      'can',
      'to',
      'of',
      'in',
      'for',
      'on',
      'with',
      'at',
      'by',
      'from',
      'as',
      'into',
      'through',
      'during',
      'before',
      'after',
      'above',
      'below',
      'between',
      'under',
      'again',
      'further',
      'then',
      'once',
      'here',
      'there',
      'when',
      'where',
      'why',
      'how',
      'all',
      'each',
      'few',
      'more',
      'most',
      'other',
      'some',
      'such',
      'no',
      'nor',
      'not',
      'only',
      'own',
      'same',
      'so',
      'than',
      'too',
      'very',
      'just',
      'and',
      'but',
      'if',
      'or',
      'because',
      'until',
      'while',
      'about',
      'against',
      'between',
      'into',
      'through',
      'during',
      'before',
      'after',
      'above',
      'below',
      'up',
      'down',
      'out',
      'off',
      'over',
      'under',
      'again',
      'further',
      'then',
      'once',
    ]);

    // 分词（简单按空格和标点分割）
    const words = text
      .toLowerCase()
      .split(/[\s,，。！？!?.;；:：""''「」【】()（）\[\]{}]+/)
      .filter((word) => word.length > 1 && !stopWords.has(word));

    return [...new Set(words)];
  }

  /**
   * 计算相关性分数
   */
  private calculateRelevance(content: string, keywords: string[]): number {
    const lowerContent = content.toLowerCase();
    let score = 0;

    for (const keyword of keywords) {
      // 计算关键词出现次数
      const regex = new RegExp(keyword, 'gi');
      const matches = lowerContent.match(regex);
      if (matches) {
        score += matches.length;
      }
    }

    // 归一化分数
    return score / Math.max(keywords.length, 1);
  }

  /**
   * 提取相关片段
   */
  private extractRelevantSnippet(
    content: string,
    keywords: string[],
    maxLength = 500,
  ): string {
    // 找到第一个关键词出现的位置
    const lowerContent = content.toLowerCase();
    let firstMatchIndex = content.length;

    for (const keyword of keywords) {
      const index = lowerContent.indexOf(keyword.toLowerCase());
      if (index !== -1 && index < firstMatchIndex) {
        firstMatchIndex = index;
      }
    }

    // 提取片段
    const start = Math.max(0, firstMatchIndex - 100);
    const end = Math.min(content.length, start + maxLength);
    let snippet = content.slice(start, end);

    // 添加省略号
    if (start > 0) snippet = '...' + snippet;
    if (end < content.length) snippet = snippet + '...';

    return snippet;
  }

  /**
   * 文本分块（用于长文档处理）
   */
  splitIntoChunks(text: string, chunkSize = 500, overlap = 50): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      chunks.push(text.slice(start, end));
      start = end - overlap;
      if (start >= text.length - overlap) break;
    }

    return chunks;
  }
}
