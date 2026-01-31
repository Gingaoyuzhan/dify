import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { KnowledgeBase } from './knowledge-base.entity';

/**
 * 知识文档实体
 * 存储知识库中的文档内容和向量嵌入
 */
@Entity('knowledge_documents')
export class KnowledgeDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** 所属知识库 */
  @ManyToOne(() => KnowledgeBase, (kb) => kb.documents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'knowledge_base_id' })
  knowledgeBase: KnowledgeBase;

  @Column({ name: 'knowledge_base_id' })
  knowledgeBaseId: string;

  /** 文档标题 */
  @Column({ length: 200 })
  title: string;

  /** 文档内容 */
  @Column({ type: 'text' })
  content: string;

  /** 文档来源（文件名或 URL） */
  @Column({ length: 500, nullable: true })
  source: string;

  /**
   * 向量嵌入
   * 使用 pgvector 存储，维度根据使用的嵌入模型确定
   * 常见维度：OpenAI text-embedding-3-small = 1536
   *
   * 注意：需要先在 PostgreSQL 中启用 pgvector 扩展：
   * CREATE EXTENSION IF NOT EXISTS vector;
   */
  @Column({
    type: 'float',
    array: true,
    nullable: true,
  })
  embedding: number[];

  @CreateDateColumn()
  createdAt: Date;
}
