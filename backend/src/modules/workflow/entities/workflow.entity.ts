import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 工作流状态枚举
 */
export enum WorkflowStatus {
  /** 草稿 */
  DRAFT = 'draft',
  /** 已发布 */
  PUBLISHED = 'published',
  /** 已归档 */
  ARCHIVED = 'archived',
}

/**
 * 工作流节点类型
 */
export interface WorkflowNode {
  /** 节点 ID */
  id: string;
  /** 节点类型：trigger(触发), action(执行), condition(条件), end(结束) */
  type: 'trigger' | 'action' | 'condition' | 'end';
  /** 节点名称 */
  name: string;
  /** 节点位置 */
  position: { x: number; y: number };
  /** 节点配置数据 */
  data: Record<string, any>;
}

/**
 * 工作流连线
 */
export interface WorkflowEdge {
  /** 连线 ID */
  id: string;
  /** 源节点 ID */
  source: string;
  /** 目标节点 ID */
  target: string;
  /** 连线标签（用于条件分支） */
  label?: string;
}

/**
 * 工作流实体
 * 存储可视化编排的工作流定义
 */
@Entity('workflows')
export class Workflow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** 工作流名称 */
  @Column({ length: 100 })
  name: string;

  /** 工作流描述 */
  @Column({ type: 'text', nullable: true })
  description: string;

  /** 工作流节点（JSON 存储） */
  @Column({ type: 'jsonb', default: [] })
  nodes: WorkflowNode[];

  /** 工作流连线（JSON 存储） */
  @Column({ type: 'jsonb', default: [] })
  edges: WorkflowEdge[];

  /** 工作流状态 */
  @Column({
    type: 'enum',
    enum: WorkflowStatus,
    default: WorkflowStatus.DRAFT,
  })
  status: WorkflowStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
