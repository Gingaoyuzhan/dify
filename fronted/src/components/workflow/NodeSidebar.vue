<script setup lang="ts">
import { Play, Bot, Database, Square, GripVertical, Info } from 'lucide-vue-next'

const onDragStart = (event: DragEvent, nodeType: string, label: string) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/vueflow', JSON.stringify({ type: nodeType, label }))
    event.dataTransfer.effectAllowed = 'move'
  }
}
</script>

<template>
  <aside class="nodes-sidebar">
    <div class="sidebar-header">
      <h3>Toolbox</h3>
    </div>
    
    <div class="node-list">
      <div class="section-label">FLOW CONTROL</div>
      
      <div 
        class="draggable-node" 
        draggable="true" 
        @dragstart="onDragStart($event, 'start', 'Start Node')"
      >
        <GripVertical :size="14" class="drag-handle" />
        <div class="icon-box start">
          <Play :size="14" />
        </div>
        <span class="label">Start Trigger</span>
      </div>

      <div 
        class="draggable-node" 
        draggable="true" 
        @dragstart="onDragStart($event, 'end', 'End Node')"
      >
        <GripVertical :size="14" class="drag-handle" />
        <div class="icon-box end">
          <Square :size="14" />
        </div>
        <span class="label">End / Output</span>
      </div>

      <div class="section-label">AI & DATA</div>

      <div 
        class="draggable-node" 
        draggable="true" 
        @dragstart="onDragStart($event, 'llm', 'LLM Model')"
      >
        <GripVertical :size="14" class="drag-handle" />
        <div class="icon-box llm">
          <Bot :size="14" />
        </div>
        <span class="label">LLM Model</span>
      </div>

      <div 
        class="draggable-node" 
        draggable="true" 
        @dragstart="onDragStart($event, 'knowledge', 'Knowledge Base')"
      >
        <GripVertical :size="14" class="drag-handle" />
        <div class="icon-box knowledge">
          <Database :size="14" />
        </div>
        <span class="label">Knowledge Retrieval</span>
      </div>
    </div>
    
    <div class="sidebar-footer">
      <div class="info-item">
        <Info :size="14" />
        <span>Drag nodes to canvas</span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.nodes-sidebar {
  width: 240px;
  height: calc(100vh - 40px); /* Adjust based on margin/padding */
  display: flex;
  flex-direction: column;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  margin: 20px 0 20px 20px;
  box-shadow: var(--shadow-sm);
  z-index: 10;
  position: absolute;
  left: 0;
  top: 0;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid var(--border-default);
}

.sidebar-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.node-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  flex: 1;
  overflow-y: auto;
}

.section-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-tertiary);
  margin-top: 8px;
  margin-bottom: 4px;
  padding-left: 4px;
}

.draggable-node {
  background: var(--bg-page);
  border: 1px solid var(--border-default);
  padding: 10px;
  border-radius: var(--radius-sm);
  cursor: grab;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s ease;
}

.draggable-node:hover {
  border-color: var(--primary);
  background: var(--bg-surface-hover);
  transform: translateX(2px);
  box-shadow: var(--shadow-sm);
}

.drag-handle {
  color: var(--text-tertiary);
  cursor: grab;
}

.icon-box {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.icon-box.start { background: var(--primary); }
.icon-box.end { background: var(--danger); }
.icon-box.llm { background: #8b5cf6; }
.icon-box.knowledge { background: #ec4899; }

.label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid var(--border-default);
  background: var(--bg-surface-active);
  border-bottom-left-radius: var(--radius-md);
  border-bottom-right-radius: var(--radius-md);
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 12px;
}
</style>
