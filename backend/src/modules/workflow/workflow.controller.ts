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
import { WorkflowService } from './workflow.service';
import { CreateWorkflowDto, UpdateWorkflowDto, ExecuteWorkflowDto } from './dto';
import { Workflow } from './entities/workflow.entity';
import { WorkflowExecutionResult } from './engine';

/**
 * 工作流控制器
 * 提供工作流 CRUD 和执行 API
 */
@Controller('workflows')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  /**
   * 创建工作流
   * POST /workflows
   */
  @Post()
  async create(@Body() dto: CreateWorkflowDto): Promise<Workflow> {
    return this.workflowService.create(dto);
  }

  /**
   * 获取所有工作流
   * GET /workflows
   */
  @Get()
  async findAll(): Promise<Workflow[]> {
    return this.workflowService.findAll();
  }

  /**
   * 获取单个工作流
   * GET /workflows/:id
   */
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Workflow> {
    return this.workflowService.findOne(id);
  }

  /**
   * 更新工作流
   * PUT /workflows/:id
   */
  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWorkflowDto,
  ): Promise<Workflow> {
    return this.workflowService.update(id, dto);
  }

  /**
   * 删除工作流
   * DELETE /workflows/:id
   */
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.workflowService.remove(id);
  }

  /**
   * 执行工作流
   * POST /workflows/:id/execute
   */
  @Post(':id/execute')
  async execute(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ExecuteWorkflowDto,
  ): Promise<WorkflowExecutionResult> {
    return this.workflowService.execute(id, dto.input);
  }
}
