<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { VueFlow, useVueFlow, type Node, type Edge, type Connection } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { Save, FolderOpen, Play, Plus, Trash2 } from 'lucide-vue-next'
import NodeSidebar from '../components/workflow/NodeSidebar.vue'
import NodeProperties from '../components/workflow/NodeProperties.vue'
import WorkflowNode from '../components/workflow/WorkflowNode.vue'
import { workflowApi } from '../api'
import type { Workflow, WorkflowNode as WFNode, WorkflowEdge as WFEdge } from '../types'

// -- State --
const workflows = ref<Workflow[]>([])
const currentWorkflow = ref<Workflow | null>(null)
const workflowName = ref('新工作流')
const isLoading = ref(false)
const isSaving = ref(false)
const isExecuting = ref(false)
const executeInput = ref('')
const executeResult = ref('')
const showExecuteModal = ref(false)
const showWorkflowList = ref(false)

// -- Initial Data --
const nodes = ref<Node[]>([
  {
    id: '1',
    type: 'custom',
    position: { x: 100, y: 250 },
    data: { label: 'Start Trigger', type: 'start', description: '用户输入触发流程' }
  },
  {
    id: '2',
    type: 'custom',
    position: { x: 400, y: 150 },
    data: { label: 'LLM 推理', type: 'llm', description: '处理用户意图' }
  },
  {
    id: '3',
    type: 'custom',
    position: { x: 400, y: 350 },
    data: { label: 'RAG 检索', type: 'knowledge', description: '搜索知识库' }
  },
  {
    id: '4',
    type: 'custom',
    position: { x: 700, y: 250 },
    data: { label: '响应输出', type: 'end', description: '返回结果给用户' }
  },
])

const edges = ref<Edge[]>([
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#6366f1' } },
  { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: '#ec4899' } },
  { id: 'e2-4', source: '2', target: '4', animated: true },
  { id: 'e3-4', source: '3', target: '4', animated: true },
])

// -- Vue Flow Hooks --
const { onConnect, addEdges, addNodes, project, findNode, removeNodes, onPaneClick } = useVueFlow()
let nodeId = 5
const getId = () => `node_${nodeId++}`

// -- State --
const selectedNode = ref<Node | null>(null)

// -- Events --
onConnect((params: Connection) => {
  addEdges([params])
})

const onDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

const onDrop = (event: DragEvent) => {
  const dataStr = event.dataTransfer?.getData('application/vueflow')
  if (!dataStr) return

  const { type, label } = JSON.parse(dataStr)

  const { left, top } = (event.target as HTMLElement).getBoundingClientRect()
  const position = project({
    x: event.clientX - left,
    y: event.clientY - top,
  })

  const newNode: Node = {
    id: getId(),
    type: 'custom',
    position,
    data: {
      label,
      type,
      description: '新节点'
    },
  }

  addNodes([newNode])
}

const onNodeClick = (event: any) => {
  if (event.node) {
    selectedNode.value = event.node
  }
}

onPaneClick(() => {
  selectedNode.value = null
})

const updateNodeData = (id: string, newData: any) => {
  const node = findNode(id)
  if (node) {
    node.data = newData
  }
}

const deleteNode = (id: string) => {
  removeNodes(id)
  selectedNode.value = null
}

// -- API 操作 --

/** 加载工作流列表 */
const loadWorkflows = async () => {
  try {
    isLoading.value = true
    workflows.value = await workflowApi.getAll()
  } catch (error) {
    console.error('加载工作流列表失败:', error)
    alert('加载工作流列表失败')
  } finally {
    isLoading.value = false
  }
}

/** 转换节点格式（前端 -> 后端） */
const convertNodesToBackend = (): WFNode[] => {
  return nodes.value.map(node => ({
    id: node.id,
    type: node.data.type,
    label: node.data.label,
    position: node.position,
    data: {
      label: node.data.label,
      description: node.data.description,
      systemPrompt: node.data.systemPrompt,
      model: node.data.model,
      temperature: node.data.temperature,
      knowledgeBaseId: node.data.knowledgeBaseId,
      topK: node.data.topK,
    }
  }))
}

/** 转换连线格式（前端 -> 后端） */
const convertEdgesToBackend = (): WFEdge[] => {
  return edges.value.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle ?? undefined,
    targetHandle: edge.targetHandle ?? undefined,
  }))
}

/** 从后端数据加载到画布 */
const loadWorkflowToCanvas = (workflow: Workflow) => {
  currentWorkflow.value = workflow
  workflowName.value = workflow.name

  // 转换节点
  nodes.value = workflow.nodes.map(node => ({
    id: node.id,
    type: 'custom',
    position: node.position,
    data: {
      label: node.data.label || node.label,
      type: node.type,
      description: node.data.description || '',
      systemPrompt: node.data.systemPrompt,
      model: node.data.model,
      temperature: node.data.temperature,
      knowledgeBaseId: node.data.knowledgeBaseId,
      topK: node.data.topK,
    }
  }))

  // 转换连线
  edges.value = workflow.edges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    animated: true,
  }))

  // 更新节点 ID 计数器
  const maxId = Math.max(...nodes.value.map(n => {
    const match = n.id.match(/\d+/)
    return match ? parseInt(match[0]) : 0
  }))
  nodeId = maxId + 1
}

/** 保存工作流 */
const saveWorkflow = async () => {
  try {
    isSaving.value = true

    const data = {
      name: workflowName.value,
      nodes: convertNodesToBackend(),
      edges: convertEdgesToBackend(),
    }

    if (currentWorkflow.value) {
      // 更新
      const updated = await workflowApi.update(currentWorkflow.value.id, data)
      currentWorkflow.value = updated
      alert('工作流已保存')
    } else {
      // 创建
      const created = await workflowApi.create(data)
      currentWorkflow.value = created
      alert('工作流已创建')
    }

    await loadWorkflows()
  } catch (error) {
    console.error('保存工作流失败:', error)
    alert('保存工作流失败')
  } finally {
    isSaving.value = false
  }
}

/** 加载选中的工作流 */
const loadSelectedWorkflow = async (workflow: Workflow) => {
  try {
    isLoading.value = true
    const detail = await workflowApi.getById(workflow.id)
    loadWorkflowToCanvas(detail)
    showWorkflowList.value = false
  } catch (error) {
    console.error('加载工作流失败:', error)
    alert('加载工作流失败')
  } finally {
    isLoading.value = false
  }
}

/** 新建工作流 */
const newWorkflow = () => {
  currentWorkflow.value = null
  workflowName.value = '新工作流'
  nodes.value = [
    {
      id: 'start_1',
      type: 'custom',
      position: { x: 100, y: 250 },
      data: { label: '开始', type: 'start', description: '用户输入触发' }
    },
  ]
  edges.value = []
  nodeId = 2
  showWorkflowList.value = false
}

/** 删除工作流 */
const deleteWorkflow = async (workflow: Workflow) => {
  if (!confirm(`确定要删除工作流 "${workflow.name}" 吗？`)) return

  try {
    await workflowApi.delete(workflow.id)
    await loadWorkflows()

    if (currentWorkflow.value?.id === workflow.id) {
      newWorkflow()
    }
  } catch (error) {
    console.error('删除工作流失败:', error)
    alert('删除工作流失败')
  }
}

/** 执行工作流 */
const executeWorkflow = async () => {
  if (!currentWorkflow.value) {
    alert('请先保存工作流')
    return
  }

  if (!executeInput.value.trim()) {
    alert('请输入内容')
    return
  }

  try {
    isExecuting.value = true
    executeResult.value = '执行中...'

    const result = await workflowApi.execute(currentWorkflow.value.id, {
      input: executeInput.value
    })

    if (result.status === 'completed') {
      executeResult.value = result.output
    } else {
      executeResult.value = `执行失败: ${result.error || '未知错误'}`
    }
  } catch (error: any) {
    console.error('执行工作流失败:', error)
    executeResult.value = `执行失败: ${error.message}`
  } finally {
    isExecuting.value = false
  }
}

// -- Lifecycle --
onMounted(() => {
  loadWorkflows()
})
</script>

<template>
  <div class="workflow-container" @drop="onDrop" @dragover="onDragOver">
    <!-- Sidebar -->
    <NodeSidebar />

    <!-- Toolbar -->
    <div class="toolbar glass-panel">
      <input
        v-model="workflowName"
        class="workflow-name-input"
        placeholder="工作流名称"
      />

      <div class="toolbar-actions">
        <button class="btn btn-secondary" @click="showWorkflowList = true" :disabled="isLoading">
          <FolderOpen :size="16" />
          <span>打开</span>
        </button>

        <button class="btn btn-secondary" @click="newWorkflow">
          <Plus :size="16" />
          <span>新建</span>
        </button>

        <button class="btn btn-primary" @click="saveWorkflow" :disabled="isSaving">
          <Save :size="16" />
          <span>{{ isSaving ? '保存中...' : '保存' }}</span>
        </button>

        <button
          class="btn btn-success"
          @click="showExecuteModal = true"
          :disabled="!currentWorkflow"
        >
          <Play :size="16" />
          <span>执行</span>
        </button>
      </div>
    </div>

    <!-- Canvas -->
    <div class="canvas-wrapper">
      <VueFlow
        v-model:nodes="nodes"
        v-model:edges="edges"
        :default-zoom="1"
        :min-zoom="0.5"
        :max-zoom="4"
        fit-view-on-init
        class="glass-flow"
        @node-click="onNodeClick"
      >
        <template #node-custom="props">
          <WorkflowNode v-bind="props" />
        </template>

        <Background pattern-color="#aaa" :gap="16" />
        <Controls />
      </VueFlow>
    </div>

    <!-- Properties Panel -->
    <NodeProperties
      :node="selectedNode"
      @close="selectedNode = null"
      @update="updateNodeData"
      @delete="deleteNode"
    />

    <!-- Workflow List Modal -->
    <div v-if="showWorkflowList" class="modal-overlay" @click.self="showWorkflowList = false">
      <div class="modal glass-panel">
        <div class="modal-header">
          <h3>选择工作流</h3>
          <button class="close-btn" @click="showWorkflowList = false">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="workflows.length === 0" class="empty-state">
            暂无工作流，点击"新建"创建
          </div>
          <div v-else class="workflow-list">
            <div
              v-for="wf in workflows"
              :key="wf.id"
              class="workflow-item"
              @click="loadSelectedWorkflow(wf)"
            >
              <div class="workflow-info">
                <div class="workflow-title">{{ wf.name }}</div>
                <div class="workflow-meta">
                  {{ wf.nodes?.length || 0 }} 个节点 ·
                  {{ new Date(wf.updatedAt).toLocaleString() }}
                </div>
              </div>
              <button class="delete-btn" @click.stop="deleteWorkflow(wf)">
                <Trash2 :size="14" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Execute Modal -->
    <div v-if="showExecuteModal" class="modal-overlay" @click.self="showExecuteModal = false">
      <div class="modal glass-panel execute-modal">
        <div class="modal-header">
          <h3>执行工作流</h3>
          <button class="close-btn" @click="showExecuteModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>输入内容</label>
            <textarea
              v-model="executeInput"
              placeholder="请输入要处理的内容..."
              rows="4"
            ></textarea>
          </div>

          <button
            class="btn btn-primary btn-block"
            @click="executeWorkflow"
            :disabled="isExecuting"
          >
            {{ isExecuting ? '执行中...' : '执行' }}
          </button>

          <div v-if="executeResult" class="result-box">
            <label>执行结果</label>
            <div class="result-content">{{ executeResult }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.workflow-container {
  display: flex;
  width: 100%;
  height: 100vh;
  position: relative;
}

.toolbar {
  position: absolute;
  top: 20px;
  left: 260px;
  right: 20px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 12px;
}

.workflow-name-input {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 8px 12px;
  color: var(--text-main);
  font-size: 14px;
  width: 200px;
}

.toolbar-actions {
  display: flex;
  gap: 8px;
}

.btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: #5558e3;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-main);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover {
  background: #059669;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.canvas-wrapper {
  flex: 1;
  height: 100%;
  margin-left: 240px;
  padding-top: 80px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  width: 500px;
  max-height: 80vh;
  border-radius: 16px;
  overflow: hidden;
}

.execute-modal {
  width: 600px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 24px;
  cursor: pointer;
  line-height: 1;
}

.modal-body {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.empty-state {
  text-align: center;
  color: var(--text-muted);
  padding: 40px;
}

.workflow-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.workflow-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.workflow-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.workflow-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.workflow-meta {
  font-size: 12px;
  color: var(--text-muted);
}

.delete-btn {
  background: rgba(239, 68, 68, 0.2);
  border: none;
  color: #ef4444;
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.3);
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--text-muted);
}

.form-group textarea {
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 12px;
  color: var(--text-main);
  font-size: 14px;
  resize: vertical;
}

.btn-block {
  width: 100%;
  justify-content: center;
}

.result-box {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.result-box label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--text-muted);
}

.result-content {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 16px;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  max-height: 300px;
  overflow-y: auto;
}

/* Vue Flow Theme */
.glass-flow {
  background: transparent;
}

:deep(.vue-flow__edge-path) {
  stroke-width: 2;
  stroke: #64748b;
}

:deep(.vue-flow__edge.selected .vue-flow__edge-path) {
  stroke: var(--primary);
}

:deep(.vue-flow__controls) {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--glass-shadow);
}

:deep(.vue-flow__controls-button) {
  background: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0;
}

:deep(.vue-flow__controls-button:last-child) {
  border-bottom: none;
}

:deep(.vue-flow__controls-button svg) {
  fill: var(--text-muted);
}

:deep(.vue-flow__controls-button:hover svg) {
  fill: var(--text-main);
}
</style>
