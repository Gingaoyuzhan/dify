import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workflow, WorkflowStatus } from './entities/workflow.entity';
import { CreateWorkflowDto, UpdateWorkflowDto } from './dto';
import { WorkflowEngine, WorkflowExecutionResult, WorkflowNodeDef, WorkflowEdgeDef } from './engine';

/**
 * 工作流服务
 * 处理工作流的 CRUD 操作和执行
 */
@Injectable()
export class WorkflowService {
  private readonly logger = new Logger(WorkflowService.name);

  constructor(
    @InjectRepository(Workflow)
    private readonly workflowRepository: Repository<Workflow>,
    private readonly workflowEngine: WorkflowEngine,
  ) {}

  /**
   * 创建工作流
   */
  async create(dto: CreateWorkflowDto): Promise<Workflow> {
    const workflow = this.workflowRepository.create({
      name: dto.name,
      description: dto.description,
      nodes: dto.nodes || [],
      edges: dto.edges || [],
      status: WorkflowStatus.DRAFT,
    });

    const saved = await this.workflowRepository.save(workflow);
    this.logger.log(`创建工作流: ${saved.id} - ${saved.name}`);
    return saved;
  }

  /**
   * 获取所有工作流
   */
  async findAll(): Promise<Workflow[]> {
    return this.workflowRepository.find({
      order: { updatedAt: 'DESC' },
    });
  }

  /**
   * 根据 ID 获取工作流
   */
  async findOne(id: string): Promise<Workflow> {
    const workflow = await this.workflowRepository.findOne({ where: { id } });
    if (!workflow) {
      throw new NotFoundException(`工作流不存在: ${id}`);
    }
    return workflow;
  }

  /**
   * 更新工作流
   */
  async update(id: string, dto: UpdateWorkflowDto): Promise<Workflow> {
    const workflow = await this.findOne(id);

    if (dto.name !== undefined) workflow.name = dto.name;
    if (dto.description !== undefined) workflow.description = dto.description;
    if (dto.nodes !== undefined) workflow.nodes = dto.nodes;
    if (dto.edges !== undefined) workflow.edges = dto.edges;
    if (dto.status !== undefined) workflow.status = dto.status;

    const saved = await this.workflowRepository.save(workflow);
    this.logger.log(`更新工作流: ${saved.id}`);
    return saved;
  }

  /**
   * 删除工作流
   */
  async remove(id: string): Promise<void> {
    const workflow = await this.findOne(id);
    await this.workflowRepository.remove(workflow);
    this.logger.log(`删除工作流: ${id}`);
  }

  /**
   * 执行工作流
   */
  async execute(id: string, userInput: string): Promise<WorkflowExecutionResult> {
    const workflow = await this.findOne(id);

    this.logger.log(`执行工作流: ${id}, 输入: ${userInput.substring(0, 50)}...`);

    // 转换节点和边的类型
    const nodes = workflow.nodes as unknown as WorkflowNodeDef[];
    const edges = workflow.edges as unknown as WorkflowEdgeDef[];

    return this.workflowEngine.execute(id, nodes, edges, userInput);
  }
}
