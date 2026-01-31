import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { LLMService } from '../../llm/llm.service';
import { RAGService } from '../../rag/rag.service';
import {
  WorkflowNodeDef,
  WorkflowEdgeDef,
  WorkflowContext,
  WorkflowExecutionResult,
  NodeExecutionResult,
  NodeExecutionStatus,
  NodeType,
} from './types';

/**
 * 工作流引擎
 * 负责解析和执行工作流
 */
@Injectable()
export class WorkflowEngine {
  private readonly logger = new Logger(WorkflowEngine.name);

  constructor(
    private readonly llmService: LLMService,
    private readonly ragService: RAGService,
  ) {}

  /**
   * 执行工作流
   */
  async execute(
    workflowId: string,
    nodes: WorkflowNodeDef[],
    edges: WorkflowEdgeDef[],
    userInput: string,
  ): Promise<WorkflowExecutionResult> {
    const executionId = uuidv4();
    const startTime = Date.now();

    this.logger.log(`开始执行工作流: ${workflowId}, 执行ID: ${executionId}`);

    // 初始化执行上下文
    const context: WorkflowContext = {
      workflowId,
      executionId,
      userInput,
      variables: { input: userInput },
      nodeResults: new Map(),
    };

    try {
      // 构建节点图
      const nodeMap = new Map(nodes.map((n) => [n.id, n]));
      const adjacencyList = this.buildAdjacencyList(edges);

      // 找到起始节点
      const startNode = nodes.find((n) => n.type === 'start');
      if (!startNode) {
        throw new Error('工作流缺少开始节点');
      }

      // 按拓扑顺序执行节点
      const executionOrder = this.topologicalSort(nodes, edges);
      this.logger.log(`执行顺序: ${executionOrder.join(' -> ')}`);

      for (const nodeId of executionOrder) {
        const node = nodeMap.get(nodeId);
        if (!node) continue;

        await this.executeNode(node, context, adjacencyList);
      }

      // 获取最终输出
      const endNode = nodes.find((n) => n.type === 'end');
      const finalOutput =
        context.finalOutput ||
        (context.variables['output'] as string) ||
        '工作流执行完成';

      const endTime = Date.now();

      this.logger.log(
        `工作流执行完成: ${executionId}, 耗时: ${endTime - startTime}ms`,
      );

      return {
        executionId,
        workflowId,
        status: 'completed',
        output: finalOutput,
        nodeResults: Array.from(context.nodeResults.values()),
        startTime,
        endTime,
      };
    } catch (error) {
      const endTime = Date.now();
      this.logger.error(`工作流执行失败: ${error.message}`);

      return {
        executionId,
        workflowId,
        status: 'failed',
        output: '',
        error: error.message,
        nodeResults: Array.from(context.nodeResults.values()),
        startTime,
        endTime,
      };
    }
  }

  /**
   * 执行单个节点
   */
  private async executeNode(
    node: WorkflowNodeDef,
    context: WorkflowContext,
    adjacencyList: Map<string, string[]>,
  ): Promise<void> {
    const startTime = Date.now();
    this.logger.log(`执行节点: ${node.id} (${node.type})`);

    const result: NodeExecutionResult = {
      nodeId: node.id,
      nodeType: node.type,
      status: NodeExecutionStatus.RUNNING,
      input: { ...context.variables },
      output: {},
      startTime,
      endTime: 0,
    };

    try {
      switch (node.type) {
        case 'start':
          await this.executeStartNode(node, context, result);
          break;
        case 'llm':
          await this.executeLLMNode(node, context, result);
          break;
        case 'knowledge':
          await this.executeKnowledgeNode(node, context, result);
          break;
        case 'end':
          await this.executeEndNode(node, context, result);
          break;
        default:
          this.logger.warn(`未知节点类型: ${node.type}`);
      }

      result.status = NodeExecutionStatus.COMPLETED;
    } catch (error) {
      result.status = NodeExecutionStatus.FAILED;
      result.error = error.message;
      throw error;
    } finally {
      result.endTime = Date.now();
      context.nodeResults.set(node.id, result);
    }
  }

  /**
   * 执行开始节点
   */
  private async executeStartNode(
    node: WorkflowNodeDef,
    context: WorkflowContext,
    result: NodeExecutionResult,
  ): Promise<void> {
    // 开始节点：将用户输入传递到下游
    result.output = { input: context.userInput };
    context.variables['startOutput'] = context.userInput;
  }

  /**
   * 执行 LLM 节点
   */
  private async executeLLMNode(
    node: WorkflowNodeDef,
    context: WorkflowContext,
    result: NodeExecutionResult,
  ): Promise<void> {
    const { systemPrompt, model, temperature } = node.data;

    // 获取输入（可能来自知识库节点的上下文）
    const input = (context.variables['currentInput'] as string) || context.userInput;
    const knowledgeContext = context.variables['knowledgeContext'] as string;

    let response: string;

    if (knowledgeContext) {
      // 有知识库上下文，使用 RAG 模式
      response = await this.llmService.askWithContext(
        input,
        knowledgeContext,
        systemPrompt as string,
      );
    } else {
      // 普通对话模式
      response = await this.llmService.ask(input, systemPrompt as string, {
        model: model as string,
        temperature: temperature as number,
      });
    }

    result.output = { response };
    context.variables['llmOutput'] = response;
    context.variables['output'] = response;
  }

  /**
   * 执行知识库节点
   */
  private async executeKnowledgeNode(
    node: WorkflowNodeDef,
    context: WorkflowContext,
    result: NodeExecutionResult,
  ): Promise<void> {
    const { knowledgeBaseId, topK = 3 } = node.data;

    const query = context.userInput;
    const retrievalResults = await this.ragService.retrieve(
      query,
      knowledgeBaseId as string,
      topK as number,
    );

    // 构建上下文
    const knowledgeContext = retrievalResults
      .map((r, i) => `[${i + 1}] ${r.title}\n${r.content}`)
      .join('\n\n');

    result.output = {
      results: retrievalResults,
      context: knowledgeContext,
    };

    context.variables['knowledgeResults'] = retrievalResults;
    context.variables['knowledgeContext'] = knowledgeContext;
  }

  /**
   * 执行结束节点
   */
  private async executeEndNode(
    node: WorkflowNodeDef,
    context: WorkflowContext,
    result: NodeExecutionResult,
  ): Promise<void> {
    // 结束节点：收集最终输出
    const output =
      (context.variables['llmOutput'] as string) ||
      (context.variables['output'] as string) ||
      context.userInput;

    result.output = { finalOutput: output };
    context.finalOutput = output;
  }

  /**
   * 构建邻接表
   */
  private buildAdjacencyList(
    edges: WorkflowEdgeDef[],
  ): Map<string, string[]> {
    const adjacencyList = new Map<string, string[]>();

    for (const edge of edges) {
      if (!adjacencyList.has(edge.source)) {
        adjacencyList.set(edge.source, []);
      }
      adjacencyList.get(edge.source)!.push(edge.target);
    }

    return adjacencyList;
  }

  /**
   * 拓扑排序
   * 确保节点按依赖顺序执行
   */
  private topologicalSort(
    nodes: WorkflowNodeDef[],
    edges: WorkflowEdgeDef[],
  ): string[] {
    const inDegree = new Map<string, number>();
    const adjacencyList = new Map<string, string[]>();

    // 初始化
    for (const node of nodes) {
      inDegree.set(node.id, 0);
      adjacencyList.set(node.id, []);
    }

    // 构建图
    for (const edge of edges) {
      adjacencyList.get(edge.source)?.push(edge.target);
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    }

    // BFS 拓扑排序
    const queue: string[] = [];
    const result: string[] = [];

    // 找到入度为 0 的节点
    for (const [nodeId, degree] of inDegree) {
      if (degree === 0) {
        queue.push(nodeId);
      }
    }

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      result.push(nodeId);

      for (const neighbor of adjacencyList.get(nodeId) || []) {
        const newDegree = (inDegree.get(neighbor) || 0) - 1;
        inDegree.set(neighbor, newDegree);
        if (newDegree === 0) {
          queue.push(neighbor);
        }
      }
    }

    return result;
  }
}
