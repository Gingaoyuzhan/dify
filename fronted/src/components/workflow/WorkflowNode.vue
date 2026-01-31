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

const variantColor = computed(() => {
  switch (props.data.type) {
    case 'start': return 'var(--color-primary)' // Yellow
    case 'end': return 'var(--color-accent-pink)' // Pink
    case 'knowledge': return 'var(--color-accent-green)' // Green
    case 'llm': return 'var(--color-accent-blue)' // Blue
    default: return 'var(--color-white)'
  }
})
</script>

<template>
  <div class="neo-node" :class="{ selected: selected }">
    <!-- Handles -->
    <Handle 
      v-if="data.type !== 'start'" 
      type="target" 
      :position="Position.Left" 
      class="neo-handle target"
    />
    
    <div class="neo-node-header" :style="{ backgroundColor: variantColor }">
      <div class="icon-box">
        <component :is="nodeIcon" :size="16" stroke-width="3" />
      </div>
      <span class="node-title">{{ data.label }}</span>
      <button class="more-btn">
        <MoreHorizontal :size="16" stroke-width="3" />
      </button>
    </div>
    
    <div class="neo-node-body">
      <p class="node-desc">{{ data.description || 'No description provided' }}</p>
      
      <div class="neo-badge" v-if="data.status">
        <span>{{ data.status.toUpperCase() }}</span>
      </div>
    </div>

    <!-- Output Handle -->
    <Handle 
      v-if="data.type !== 'end'" 
      type="source" 
      :position="Position.Right" 
      class="neo-handle source" 
    />
  </div>
</template>

<style scoped>
.neo-node {
  width: 240px;
  background: var(--color-white);
  border: var(--border-width) solid var(--color-black);
  box-shadow: var(--shadow-hard);
  transition: all 0.15s ease-in-out;
}

.neo-node:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 0 var(--color-black);
}

.neo-node.selected {
  outline: 2px dashed var(--color-black);
  outline-offset: 4px;
}

.neo-node-header {
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: var(--border-width) solid var(--color-black);
  /* Color set dynamically via variantColor */
}

.icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-black);
}

.node-title {
  flex: 1;
  font-weight: 800;
  font-size: 14px;
  text-transform: uppercase;
  color: var(--color-black);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.more-btn {
  background: transparent;
  border: none;
  color: var(--color-black);
  cursor: pointer;
  padding: 0;
  display: flex;
}

.neo-node-body {
  padding: 12px;
  background: var(--color-white);
}

.node-desc {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  line-height: 1.4;
  margin-bottom: 12px;
}

.neo-badge {
  display: inline-block;
  background: var(--color-black);
  color: var(--color-white);
  padding: 4px 8px;
  font-size: 10px;
  font-weight: 800;
  border-radius: 999px; /* Pill shape contrasts with sharp box */
}

/* Handles */
.neo-handle {
  width: 12px !important;
  height: 12px !important;
  background: var(--color-white) !important;
  border: var(--border-width) solid var(--color-black) !important;
  border-radius: 0 !important; /* Square handles */
  z-index: 10;
}

.neo-handle:hover {
  background: var(--color-primary) !important;
}

.target { left: -8px !important; }
.source { right: -8px !important; }
</style>
