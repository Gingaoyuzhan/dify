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
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: 'var(--color-black)', strokeWidth: '3px' } },
  { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: 'var(--color-black)', strokeWidth: '3px' } },
  { id: 'e2-4', source: '2', target: '4', animated: true, style: { stroke: 'var(--color-black)', strokeWidth: '3px' } },
  { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: 'var(--color-black)', strokeWidth: '3px' } },
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
        class="neo-flow"
        @node-click="onNodeClick"
      >
        <template #node-custom="props">
          <WorkflowNode v-bind="props" />
        </template>
        
        <Background pattern-color="var(--color-black)" :gap="24" :size="3" />
        
        <Controls position="top-right" />
        
        <MiniMap 
          node-color="var(--color-primary)" 
          mask-color="rgba(255, 255, 255, 0.7)" 
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
  height: 100%;
  position: relative;
  background: var(--bg-surface-secondary);
}

.canvas-wrapper {
  flex: 1;
  height: 100%;
  position: relative;
  z-index: 1;
  padding-left: 20px; /* Spacing from Sidebar */
}

/* Customize Vue Flow Theme */
.neo-flow {
  background: var(--bg-surface-secondary);
}

:deep(.vue-flow__edge-path) {
  stroke-width: 3px !important;
  stroke: var(--color-black) !important;
}

:deep(.vue-flow__edge.selected .vue-flow__edge-path) {
  stroke: var(--color-primary) !important;
  stroke-dasharray: 4 !important;
}

/* Controls */
:deep(.vue-flow__controls) {
  background: var(--color-white);
  border: var(--border-width) solid var(--color-black);
  box-shadow: var(--shadow-hard);
  margin: 20px;
  display: flex;
  flex-direction: column;
}

:deep(.vue-flow__controls-button) {
  background: var(--color-white);
  border-bottom: var(--border-width) solid var(--color-black);
  border-radius: 0;
  width: 32px;
  height: 32px;
  color: var(--color-black);
}

:deep(.vue-flow__controls-button:last-child) {
  border-bottom: none;
}

:deep(.vue-flow__controls-button:hover) {
  background: var(--color-primary);
}

:deep(.vue-flow__controls-button svg) {
  fill: var(--color-black);
}

/* Minimap */
:deep(.vue-flow__minimap) {
  border: var(--border-width) solid var(--color-black);
  box-shadow: var(--shadow-hard);
  background: var(--color-white);
  bottom: 24px;
  right: 24px;
}
</style>
