<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { computed } from 'vue'
import { Play, Bot, Database, Square, MoreHorizontal } from 'lucide-vue-next'

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  }
})

const iconMap = {
  start: Play,
  llm: Bot,
  knowledge: Database,
  end: Square
}

const nodeIcon = computed(() => iconMap[props.data.type as keyof typeof iconMap] || Bot)

const typeColor = computed(() => {
  switch (props.data.type) {
    case 'start': return 'var(--primary)'
    case 'end': return 'var(--danger)'
    case 'knowledge': return '#ec4899'
    case 'llm': return '#8b5cf6'
    default: return 'var(--text-secondary)'
  }
})
</script>

<template>
  <div class="custom-node" :class="{ selected: selected }">
    <!-- Handles -->
    <Handle 
      v-if="data.type !== 'start'" 
      type="target" 
      :position="Position.Left" 
      class="node-handle target"
    />
    
    <div class="node-header">
      <div class="icon-box" :style="{ color: typeColor, background: `color-mix(in srgb, ${typeColor}, transparent 90%)` }">
        <component :is="nodeIcon" :size="14" />
      </div>
      <span class="node-title">{{ data.label }}</span>
      <button class="more-btn">
        <MoreHorizontal :size="14" />
      </button>
    </div>
    
    <div class="node-body">
      <p class="node-desc">{{ data.description || 'No description provided' }}</p>
      
      <div class="status-indicator" v-if="data.status">
        <div class="dot" :class="data.status"></div>
        <span>{{ data.status }}</span>
      </div>
    </div>

    <!-- Output Handle -->
    <Handle 
      v-if="data.type !== 'end'" 
      type="source" 
      :position="Position.Right" 
      class="node-handle source" 
    />
  </div>
</template>

<style scoped>
.custom-node {
  width: 240px;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
  overflow: visible; /* For handles */
}

.custom-node:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--border-hover);
  transform: translateY(-1px);
}

.custom-node.selected {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-bg);
}

.node-header {
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid var(--border-default);
  background: var(--bg-surface);
  border-top-left-radius: var(--radius-md);
  border-top-right-radius: var(--radius-md);
}

.icon-box {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.node-title {
  flex: 1;
  font-weight: 600;
  font-size: 13px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.more-btn {
  background: transparent;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
}

.more-btn:hover {
  background: var(--bg-surface-active);
  color: var(--text-primary);
}

.node-body {
  padding: 12px;
  background: var(--bg-page); /* Slight contrast for body */
  border-bottom-left-radius: var(--radius-md);
  border-bottom-right-radius: var(--radius-md);
}

.node-desc {
  margin: 0;
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 11px;
  color: var(--text-tertiary);
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--text-tertiary);
}

.dot.running { background-color: var(--warning); box-shadow: 0 0 4px var(--warning); }
.dot.completed { background-color: var(--success); }
.dot.error { background-color: var(--danger); }

/* Handles */
.node-handle {
  width: 8px !important;
  height: 8px !important;
  background: var(--bg-surface) !important;
  border: 2px solid var(--text-tertiary) !important;
  transition: all 0.2s;
  z-index: 10;
}

.node-handle:hover,
.node-handle.valid {
  border-color: var(--primary) !important;
  transform: scale(1.2);
}

.custom-node.selected .node-handle {
  border-color: var(--primary) !important;
}

.target { left: -5px !important; }
.source { right: -5px !important; }
</style>
