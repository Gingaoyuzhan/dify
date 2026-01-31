import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ChatMessage } from './chat-message.entity';
import { Workflow } from '../../workflow/entities/workflow.entity';

/**
 * 对话会话实体
 * 管理用户与 Agent 的对话上下文
 */
@Entity('chat_sessions')
export class ChatSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** 关联的工作流（可选） */
  @ManyToOne(() => Workflow, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'workflow_id' })
  workflow: Workflow;

  @Column({ name: 'workflow_id', nullable: true })
  workflowId: string;

  /** 会话标题（自动生成或用户设置） */
  @Column({ length: 200, nullable: true })
  title: string;

  /** 会话消息 */
  @OneToMany(() => ChatMessage, (msg) => msg.session)
  messages: ChatMessage[];

  @CreateDateColumn()
  createdAt: Date;
}
