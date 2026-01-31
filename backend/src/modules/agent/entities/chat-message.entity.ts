import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ChatSession } from './chat-session.entity';

/**
 * 消息角色枚举
 */
export enum MessageRole {
  /** 用户消息 */
  USER = 'user',
  /** AI 助手消息 */
  ASSISTANT = 'assistant',
  /** 系统消息 */
  SYSTEM = 'system',
}

/**
 * 消息来源引用
 * 用于回答溯源
 */
export interface MessageSource {
  /** 来源类型：knowledge(知识库), workflow(工作流节点) */
  type: 'knowledge' | 'workflow';
  /** 来源 ID（知识文档 ID 或工作流节点 ID） */
  id: string;
  /** 来源标题或名称 */
  title: string;
  /** 引用的内容片段 */
  content?: string;
}

/**
 * 对话消息实体
 * 存储对话中的每条消息
 */
@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** 所属会话 */
  @ManyToOne(() => ChatSession, (session) => session.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'session_id' })
  session: ChatSession;

  @Column({ name: 'session_id' })
  sessionId: string;

  /** 消息角色 */
  @Column({
    type: 'enum',
    enum: MessageRole,
  })
  role: MessageRole;

  /** 消息内容 */
  @Column({ type: 'text' })
  content: string;

  /** 消息来源引用（用于溯源） */
  @Column({ type: 'jsonb', nullable: true })
  sources: MessageSource[];

  @CreateDateColumn()
  createdAt: Date;
}
