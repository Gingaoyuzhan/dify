<script setup lang="ts">
import { Play, Bot, Database, Square, GripVertical, Plus } from 'lucide-vue-next'

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
      <h3>COMPONENTS</h3>
    </div>
    
    <div class="node-list">
      <div class="section-label">FLOW CONTROL</div>
      
      <div 
        class="draggable-node neo-press" 
        draggable="true" 
        @dragstart="onDragStart($event, 'start', 'Start Node')"
      >
        <div class="grip-box">
          <GripVertical :size="14" />
        </div>
        <div class="icon-box start">
          <Play :size="16" stroke-width="3" />
        </div>
        <span class="label">START TRIGGER</span>
        <Plus :size="14" class="add-icon" />
      </div>

      <div 
        class="draggable-node neo-press" 
        draggable="true" 
        @dragstart="onDragStart($event, 'end', 'End Node')"
      >
         <div class="grip-box">
          <GripVertical :size="14" />
        </div>
        <div class="icon-box end">
          <Square :size="16" stroke-width="3" />
        </div>
        <span class="label">END / OUTPUT</span>
        <Plus :size="14" class="add-icon" />
      </div>

      <div class="section-label">AI & DATA</div>

      <div 
        class="draggable-node neo-press" 
        draggable="true" 
        @dragstart="onDragStart($event, 'llm', 'LLM Model')"
      >
         <div class="grip-box">
          <GripVertical :size="14" />
        </div>
        <div class="icon-box llm">
          <Bot :size="16" stroke-width="3" />
        </div>
        <span class="label">LLM MODEL</span>
        <Plus :size="14" class="add-icon" />
      </div>

      <div 
        class="draggable-node neo-press" 
        draggable="true" 
        @dragstart="onDragStart($event, 'knowledge', 'Knowledge Base')"
      >
         <div class="grip-box">
          <GripVertical :size="14" />
        </div>
        <div class="icon-box knowledge">
          <Database :size="16" stroke-width="3" />
        </div>
        <span class="label">KNOWLEDGE</span>
        <Plus :size="14" class="add-icon" />
      </div>
    </div>
    
    <div class="sidebar-footer">
      <span>DRAG TO ADD</span>
    </div>
  </aside>
</template>

<style scoped>
.nodes-sidebar {
  width: 260px;
  height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
  background: var(--color-white);
  border: var(--border-width) solid var(--color-black);
  margin: 20px 0 20px 20px;
  box-shadow: var(--shadow-hard);
  z-index: 10;
  position: absolute;
  left: 0;
  top: 0;
}

.sidebar-header {
  padding: 16px;
  border-bottom: var(--border-width) solid var(--color-black);
  background: var(--color-primary);
}

.sidebar-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 900;
  color: var(--color-black);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.node-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

.section-label {
  font-size: 11px;
  font-weight: 800;
  color: var(--text-secondary);
  background: var(--bg-surface-secondary);
  padding: 4px 8px;
  border: 1px solid var(--color-black);
  display: inline-block;
  align-self: flex-start;
  margin-bottom: 4px;
}

.draggable-node {
  background: var(--color-white);
  border: var(--border-width) solid var(--color-black);
  padding: 12px;
  cursor: grab;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

/* Hover effect handled by .neo-press global class, but we add border color shift */
.draggable-node:hover {
  border-color: var(--color-black);
  background: var(--bg-surface-secondary);
  /* Neo-press handles translate/shadow */
}

.grip-box {
  color: var(--text-secondary);
  display: flex;
  align-items: center;
}

.icon-box {
  width: 32px;
  height: 32px;
  border: 2px solid var(--color-black);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-white);
  color: var(--color-black);
}

.icon-box.start { background: var(--color-primary); }
.icon-box.end { background: var(--color-accent-pink); }
.icon-box.llm { background: var(--color-accent-blue); }
.icon-box.knowledge { background: var(--color-accent-green); }

.label {
  font-size: 13px;
  font-weight: 800;
  color: var(--color-black);
  flex: 1;
}

.add-icon {
  opacity: 0;
  transition: opacity 0.2s;
}

.draggable-node:hover .add-icon {
  opacity: 1;
}

.sidebar-footer {
  padding: 12px;
  border-top: var(--border-width) solid var(--color-black);
  background: var(--bg-surface-secondary);
  text-align: center;
  font-size: 11px;
  font-weight: 800;
  color: var(--text-secondary);
  letter-spacing: 1px;
}
</style>
