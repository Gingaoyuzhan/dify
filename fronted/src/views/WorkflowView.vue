<script setup lang="ts">
import { ref } from 'vue'
import { VueFlow, useVueFlow, type Node, type Edge, type Connection } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import NodeProperties from '../components/workflow/NodeProperties.vue'
import WorkflowNode from '../components/workflow/WorkflowNode.vue'
import NodeSidebar from '../components/workflow/NodeSidebar.vue'

// -- Initial Data --
const initialNodes = ref<Node[]>([
  { 
    id: '1', 
    type: 'custom', 
    position: { x: 100, y: 250 }, 
    data: { label: 'Start Trigger', type: 'start', description: 'User input triggers flow', status: 'ready' } 
  },
  { 
    id: '2', 
    type: 'custom', 
    position: { x: 450, y: 150 }, 
    data: { label: 'LLM Reasoning', type: 'llm', description: 'Process user intent via GPT-4', status: 'ready' } 
  },
  { 
    id: '3', 
    type: 'custom', 
    position: { x: 450, y: 350 }, 
    data: { label: 'RAG Retrieval', type: 'knowledge', description: 'Search company knowledge base', status: 'ready' } 
  },
  { 
    id: '4', 
    type: 'custom', 
    position: { x: 800, y: 250 }, 
    data: { label: 'Response', type: 'end', description: 'Send final reply to user', status: 'ready' } 
  },
])

const initialEdges = ref<Edge[]>([
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: 'var(--text-tertiary)' } },
  { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: 'var(--text-tertiary)' } },
  { id: 'e2-4', source: '2', target: '4', animated: true, style: { stroke: 'var(--text-tertiary)' } },
  { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: 'var(--text-tertiary)' } },
])

// -- Vue Flow Hooks --
const { onConnect, addEdges, addNodes, project, findNode, removeNodes, onPaneClick } = useVueFlow()
let id = 5
const getId = () => `${id++}`

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
      description: 'New node',
      status: 'ready'
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
</script>

<template>
  <div class="workflow-container" @drop="onDrop" @dragover="onDragOver">
    <!-- Sidebar -->
    <NodeSidebar />

    <!-- Canvas -->
    <div class="canvas-wrapper">
      <VueFlow
        v-model:nodes="initialNodes"
        v-model:edges="initialEdges"
        :default-zoom="1"
        :min-zoom="0.5"
        :max-zoom="4"
        fit-view-on-init
        class="saas-flow"
        @node-click="onNodeClick"
      >
        <template #node-custom="props">
          <WorkflowNode v-bind="props" />
        </template>
        
        <Background pattern-color="var(--border-default)" :gap="20" :size="2" />
        
        <Controls position="top-right" />
        
        <MiniMap 
          node-color="var(--primary)" 
          mask-color="var(--bg-surface)" 
          class="custom-minimap" 
        />
      </VueFlow>
    </div>

    <!-- Properties Panel -->
    <NodeProperties 
      :node="selectedNode" 
      @close="selectedNode = null"
      @update="updateNodeData"
      @delete="deleteNode"
    />
  </div>
</template>

<style scoped>
.workflow-container {
  display: flex;
  width: 100%;
  height: 100vh;
  position: relative;
  background: var(--bg-page);
}

.canvas-wrapper {
  flex: 1;
  height: 100%;
  margin-left: var(--sidebar-width); /* Sidebar is fixed/absolute in this layout design? No, waiting for sidebar update */
  /* Sidebar handling: The current NodeSidebar seems to be absolute, let's check. 
     The MainLayout wraps this, but NodeSidebar is inside WorkflowView. 
     Correction: NodeSidebar in original design was absolute. 
     We should ensure it works with the layout. */
  position: relative;
  z-index: 1;
}

/* Customize Vue Flow Theme */
.saas-flow {
  background: var(--bg-page);
}

:deep(.vue-flow__edge-path) {
  stroke-width: 2;
  transition: stroke 0.3s;
}

:deep(.vue-flow__edge.selected .vue-flow__edge-path) {
  stroke: var(--primary) !important;
}

/* Controls */
:deep(.vue-flow__controls) {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
  margin: 10px;
}

:deep(.vue-flow__controls-button) {
  background: transparent;
  border-bottom: 1px solid var(--border-default);
  border-radius: 0;
  width: 28px;
  height: 28px;
}

:deep(.vue-flow__controls-button:last-child) {
  border-bottom: none;
}

:deep(.vue-flow__controls-button svg) {
  fill: var(--text-secondary);
}

:deep(.vue-flow__controls-button:hover svg) {
  fill: var(--text-primary);
}

/* Minimap */
:deep(.vue-flow__minimap) {
  border-radius: var(--radius-md);
  border: 1px solid var(--border-default);
  box-shadow: var(--shadow-sm);
  background: var(--bg-surface);
  bottom: 20px;
  right: 20px;
}
</style>
