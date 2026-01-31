import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AgentService, ChatResponse } from './agent.service';
import { CreateSessionDto, SendMessageDto } from './dto';
import { ChatSession } from './entities/chat-session.entity';
import { ChatMessage } from './entities/chat-message.entity';

/**
 * Agent 控制器
 * 提供对话会话和消息 API
 */
@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  // ========== 会话 API ==========

  /**
   * 创建会话
   * POST /agent/sessions
   */
  @Post('sessions')
  async createSession(@Body() dto: CreateSessionDto): Promise<ChatSession> {
    return this.agentService.createSession(dto);
  }

  /**
   * 获取所有会话
   * GET /agent/sessions
   */
  @Get('sessions')
  async findAllSessions(): Promise<ChatSession[]> {
    return this.agentService.findAllSessions();
  }

  /**
   * 获取单个会话（包含消息）
   * GET /agent/sessions/:id
   */
  @Get('sessions/:id')
  async findSession(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ChatSession> {
    return this.agentService.findSession(id);
  }

  /**
   * 删除会话
   * DELETE /agent/sessions/:id
   */
  @Delete('sessions/:id')
  async removeSession(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.agentService.removeSession(id);
  }

  // ========== 消息 API ==========

  /**
   * 发送消息并获取 AI 回复
   * POST /agent/sessions/:sessionId/chat
   */
  @Post('sessions/:sessionId/chat')
  async chat(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Body() dto: SendMessageDto,
  ): Promise<ChatResponse> {
    return this.agentService.chat(sessionId, dto);
  }

  /**
   * 发送消息（仅保存，不生成回复）
   * POST /agent/sessions/:sessionId/messages
   */
  @Post('sessions/:sessionId/messages')
  async sendMessage(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Body() dto: SendMessageDto,
  ): Promise<ChatMessage> {
    return this.agentService.sendMessage(sessionId, dto);
  }

  /**
   * 获取会话的所有消息
   * GET /agent/sessions/:sessionId/messages
   */
  @Get('sessions/:sessionId/messages')
  async findMessages(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
  ): Promise<ChatMessage[]> {
    return this.agentService.findMessages(sessionId);
  }
}
