import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KnowledgeBase } from './entities/knowledge-base.entity';
import { KnowledgeDocument } from './entities/knowledge-document.entity';
import {
  CreateKnowledgeBaseDto,
  UpdateKnowledgeBaseDto,
  CreateDocumentDto,
} from './dto';

/**
 * 知识库服务
 * 处理知识库和文档的管理
 */
@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name);

  constructor(
    @InjectRepository(KnowledgeBase)
    private readonly kbRepository: Repository<KnowledgeBase>,
    @InjectRepository(KnowledgeDocument)
    private readonly docRepository: Repository<KnowledgeDocument>,
  ) {}

  // ========== 知识库操作 ==========

  /**
   * 创建知识库
   */
  async createKnowledgeBase(dto: CreateKnowledgeBaseDto): Promise<KnowledgeBase> {
    const kb = this.kbRepository.create({
      name: dto.name,
      description: dto.description,
    });

    const saved = await this.kbRepository.save(kb);
    this.logger.log(`创建知识库: ${saved.id} - ${saved.name}`);
    return saved;
  }

  /**
   * 获取所有知识库
   */
  async findAllKnowledgeBases(): Promise<KnowledgeBase[]> {
    return this.kbRepository.find({
      order: { updatedAt: 'DESC' },
    });
  }

  /**
   * 获取单个知识库
   */
  async findKnowledgeBase(id: string): Promise<KnowledgeBase> {
    const kb = await this.kbRepository.findOne({
      where: { id },
      relations: ['documents'],
    });
    if (!kb) {
      throw new NotFoundException(`知识库不存在: ${id}`);
    }
    return kb;
  }

  /**
   * 更新知识库
   */
  async updateKnowledgeBase(
    id: string,
    dto: UpdateKnowledgeBaseDto,
  ): Promise<KnowledgeBase> {
    const kb = await this.findKnowledgeBase(id);

    if (dto.name !== undefined) kb.name = dto.name;
    if (dto.description !== undefined) kb.description = dto.description;

    const saved = await this.kbRepository.save(kb);
    this.logger.log(`更新知识库: ${saved.id}`);
    return saved;
  }

  /**
   * 删除知识库
   */
  async removeKnowledgeBase(id: string): Promise<void> {
    const kb = await this.findKnowledgeBase(id);
    await this.kbRepository.remove(kb);
    this.logger.log(`删除知识库: ${id}`);
  }

  // ========== 文档操作 ==========

  /**
   * 添加文档到知识库
   */
  async addDocument(
    knowledgeBaseId: string,
    dto: CreateDocumentDto,
  ): Promise<KnowledgeDocument> {
    // 验证知识库存在
    await this.findKnowledgeBase(knowledgeBaseId);

    const doc = this.docRepository.create({
      knowledgeBaseId,
      title: dto.title,
      content: dto.content,
      source: dto.source,
      // embedding 后续通过 RAG 服务生成
    });

    const saved = await this.docRepository.save(doc);
    this.logger.log(`添加文档: ${saved.id} 到知识库 ${knowledgeBaseId}`);
    return saved;
  }

  /**
   * 获取知识库的所有文档
   */
  async findDocuments(knowledgeBaseId: string): Promise<KnowledgeDocument[]> {
    return this.docRepository.find({
      where: { knowledgeBaseId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 获取单个文档
   */
  async findDocument(id: string): Promise<KnowledgeDocument> {
    const doc = await this.docRepository.findOne({ where: { id } });
    if (!doc) {
      throw new NotFoundException(`文档不存在: ${id}`);
    }
    return doc;
  }

  /**
   * 删除文档
   */
  async removeDocument(id: string): Promise<void> {
    const doc = await this.findDocument(id);
    await this.docRepository.remove(doc);
    this.logger.log(`删除文档: ${id}`);
  }
}
