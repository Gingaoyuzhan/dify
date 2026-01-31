import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { KnowledgeDocument } from './knowledge-document.entity';

/**
 * 知识库实体
 * 用于组织和管理知识文档
 */
@Entity('knowledge_bases')
export class KnowledgeBase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** 知识库名称 */
  @Column({ length: 100 })
  name: string;

  /** 知识库描述 */
  @Column({ type: 'text', nullable: true })
  description: string;

  /** 关联的文档 */
  @OneToMany(() => KnowledgeDocument, (doc) => doc.knowledgeBase)
  documents: KnowledgeDocument[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
