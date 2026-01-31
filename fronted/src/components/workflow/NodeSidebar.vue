<script setup lang="ts">
import { Bot, Play, Database, Square, Fingerprint } from 'lucide-vue-next'

const onDragStart = (event: DragEvent, nodeType: string, label: string) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/vueflow', JSON.stringify({ type: nodeType, label }))
    event.dataTransfer.effectAllowed = 'move'
  }
}
</script>

<template>
  <aside class="nodes-sidebar glass-panel">
    <div class="sidebar-header">
      <h3>Components</h3>
      <p>Drag to add</p>
    </div>
    
    <div class="node-list">
      <div 
        class="draggable-node" 
        draggable="true" 
        @dragstart="onDragStart($event, 'start', 'Start Node')"
      >
        <Play :size="16" class="icon start" />
        <span>Start Trigger</span>
      </div>

      <div 
        class="draggable-node" 
        draggable="true" 
        @dragstart="onDragStart($event, 'llm', 'LLM Model')"
      >
        <Bot :size="16" class="icon llm" />
        <span>LLM Model</span>
      </div>

      <div 
        class="draggable-node" 
        draggable="true" 
        @dragstart="onDragStart($event, 'knowledge', 'Knowledge Base')"
      >
        <Database :size="16" class="icon knowledge" />
        <span>Knowledge Retrieval</span>
      </div>

      <div 
        class="draggable-node" 
        draggable="true" 
        @dragstart="onDragStart($event, 'end', 'End Node')"
      >
        <Square :size="16" class="icon end" />
        <span>End / Output</span>
      </div>
    </div>
    
    <div class="sidebar-footer">
      <div class="info-item">
        <Fingerprint :size="14" />
        <span>Auto-save enabled</span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.nodes-sidebar {
  width: 240px;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--glass-border);
  border-right: none;
  border-top: none;
  border-bottom: none;
  z-index: 10;
  position: absolute;
  left: 0;
  top: 0;
  padding: 20px;
}

.sidebar-header h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
}

.sidebar-header p {
  margin: 0 0 20px 0;
  font-size: 12px;
  color: var(--text-muted);
}

.node-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.draggable-node {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 12px;
  border-radius: 8px;
  cursor: grab;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s ease;
  font-size: 14px;
}

.draggable-node:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
  border-color: rgba(99, 102, 241, 0.3);
}

.draggable-node .icon {
  opacity: 0.8;
}

.draggable-node .icon.start { color: #3b82f6; }
.draggable-node .icon.llm { color: #6366f1; }
.draggable-node .icon.knowledge { color: #ec4899; }
.draggable-node .icon.end { color: #ef4444; }

.sidebar-footer {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
  font-size: 12px;
}
</style>
