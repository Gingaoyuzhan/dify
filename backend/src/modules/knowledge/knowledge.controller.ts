import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import {
  CreateKnowledgeBaseDto,
  UpdateKnowledgeBaseDto,
  CreateDocumentDto,
} from './dto';
import { KnowledgeBase } from './entities/knowledge-base.entity';
import { KnowledgeDocument } from './entities/knowledge-document.entity';

/**
 * 知识库控制器
 * 提供知识库和文档管理 API
 */
@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  // ========== 知识库 API ==========

  /**
   * 创建知识库
   * POST /knowledge/bases
   */
  @Post('bases')
  async createBase(@Body() dto: CreateKnowledgeBaseDto): Promise<KnowledgeBase> {
    return this.knowledgeService.createKnowledgeBase(dto);
  }

  /**
   * 获取所有知识库
   * GET /knowledge/bases
   */
  @Get('bases')
  async findAllBases(): Promise<KnowledgeBase[]> {
    return this.knowledgeService.findAllKnowledgeBases();
  }

  /**
   * 获取单个知识库
   * GET /knowledge/bases/:id
   */
  @Get('bases/:id')
  async findBase(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<KnowledgeBase> {
    return this.knowledgeService.findKnowledgeBase(id);
  }

  /**
   * 更新知识库
   * PUT /knowledge/bases/:id
   */
  @Put('bases/:id')
  async updateBase(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateKnowledgeBaseDto,
  ): Promise<KnowledgeBase> {
    return this.knowledgeService.updateKnowledgeBase(id, dto);
  }

  /**
   * 删除知识库
   * DELETE /knowledge/bases/:id
   */
  @Delete('bases/:id')
  async removeBase(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.knowledgeService.removeKnowledgeBase(id);
  }

  // ========== 文档 API ==========

  /**
   * 添加文档到知识库
   * POST /knowledge/bases/:baseId/documents
   */
  @Post('bases/:baseId/documents')
  async addDocument(
    @Param('baseId', ParseUUIDPipe) baseId: string,
    @Body() dto: CreateDocumentDto,
  ): Promise<KnowledgeDocument> {
    return this.knowledgeService.addDocument(baseId, dto);
  }

  /**
   * 获取知识库的所有文档
   * GET /knowledge/bases/:baseId/documents
   */
  @Get('bases/:baseId/documents')
  async findDocuments(
    @Param('baseId', ParseUUIDPipe) baseId: string,
  ): Promise<KnowledgeDocument[]> {
    return this.knowledgeService.findDocuments(baseId);
  }

  /**
   * 获取单个文档
   * GET /knowledge/documents/:id
   */
  @Get('documents/:id')
  async findDocument(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<KnowledgeDocument> {
    return this.knowledgeService.findDocument(id);
  }

  /**
   * 删除文档
   * DELETE /knowledge/documents/:id
   */
  @Delete('documents/:id')
  async removeDocument(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.knowledgeService.removeDocument(id);
  }
}
