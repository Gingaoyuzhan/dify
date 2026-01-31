<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { computed } from 'vue'
import { Play, Bot, Database, Square } from 'lucide-vue-next'

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

const nodeColor = computed(() => {
  switch (props.data.type) {
    case 'start': return '#3b82f6' // Blue
    case 'end': return '#ef4444' // Red
    case 'knowledge': return '#ec4899' // Pink
    case 'llm': return '#6366f1' // Indigo
    default: return '#6366f1'
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
      class="node-handle"
    />
    
    <div class="node-content">
      <div class="node-header" :style="{ background: `linear-gradient(135deg, ${nodeColor}22, transparent)` }">
        <div class="node-icon" :style="{ color: nodeColor }">
          <component :is="nodeIcon" :size="16" />
        </div>
        <span class="node-title">{{ data.label }}</span>
      </div>
      
      <div class="node-body">
        <div class="status-indicator" v-if="data.status">
          <div class="dot" :class="data.status"></div>
          <span>{{ data.status }}</span>
        </div>
        <p v-else class="node-desc">{{ data.description || 'Configure this node' }}</p>
      </div>
    </div>

    <Handle 
      v-if="data.type !== 'end'" 
      type="source" 
      :position="Position.Right" 
      class="node-handle" 
    />
  </div>
</template>

<style scoped>
.custom-node {
  width: 200px;
  background: rgba(30, 41, 59, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
  overflow: hidden;
}

.custom-node.selected {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.3);
}

.node-header {
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.node-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.node-title {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-main);
}

.node-body {
  padding: 12px;
  font-size: 12px;
  color: var(--text-muted);
}

.node-desc {
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #94a3b8;
}

.dot.running { background-color: #fbbf24; box-shadow: 0 0 8px #fbbf24; }
.dot.completed { background-color: #10b981; box-shadow: 0 0 8px #10b981; }
.dot.error { background-color: #ef4444; }

/* Override default Handle styles */
.node-handle {
  width: 10px;
  height: 10px;
  background: var(--text-muted);
  border: 2px solid var(--bg-dark);
}

.node-handle:hover {
  background: var(--primary);
  transform: scale(1.2);
}
</style>
