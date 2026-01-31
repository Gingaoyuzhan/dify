<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, Settings2, Trash2 } from 'lucide-vue-next'
import type { Node } from '@vue-flow/core'

const props = defineProps<{
  node: Node | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update', id: string, data: any): void
  (e: 'delete', id: string): void
}>()

const formData = ref({
  label: '',
  description: ''
})

watch(() => props.node, (newNode) => {
  if (newNode) {
    formData.value = {
      label: newNode.data.label || '',
      description: newNode.data.description || ''
    }
  }
}, { immediate: true })

const saveChanges = () => {
  if (props.node) {
    emit('update', props.node.id, { 
      ...props.node.data, 
      label: formData.value.label,
      description: formData.value.description 
    })
  }
}

const deleteNode = () => {
  if (props.node && confirm('Are you sure you want to delete this node?')) {
    emit('delete', props.node.id)
    emit('close')
  }
}
</script>

<template>
  <transition name="slide">
    <aside v-if="node" class="properties-panel">
      <div class="panel-header">
        <div class="header-title">
          <Settings2 :size="16" />
          <span>Configuration</span>
        </div>
        <button class="icon-btn" @click="$emit('close')">
          <X :size="16" />
        </button>
      </div>
      
      <div class="panel-content">
        <div class="node-meta">
          <span class="meta-label">ID:</span>
          <code class="meta-value">{{ node.id }}</code>
          <span class="meta-label">Type:</span>
          <code class="meta-value">{{ node.type }}</code>
        </div>
        
        <div class="form-group">
          <label>Node Label</label>
          <input 
            v-model="formData.label" 
            type="text" 
            class="input" 
            placeholder="Name your node"
            @input="saveChanges"
          />
        </div>
        
        <div class="form-group">
          <label>Description</label>
          <textarea 
            v-model="formData.description" 
            class="input textarea" 
            rows="4"
            placeholder="Describe functionality..."
            @input="saveChanges"
          ></textarea>
        </div>

        <div class="actions">
           <button class="btn-delete" @click="deleteNode">
            <Trash2 :size="14" />
            <span>Delete Node</span>
          </button>
        </div>
      </div>
    </aside>
  </transition>
</template>

<style scoped>
.properties-panel {
  width: 320px;
  height: calc(100vh - 40px);
  position: absolute;
  right: 20px;
  top: 20px;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  z-index: 20;
}

.panel-header {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-default);
  background: var(--bg-surface-hover);
  border-top-left-radius: var(--radius-md);
  border-top-right-radius: var(--radius-md);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 14px;
}

.panel-content {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.node-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 12px;
  color: var(--text-tertiary);
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-default);
}

.meta-value {
  background: var(--bg-surface-active);
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--text-secondary);
  font-family: monospace;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 500;
}

.input {
  background: var(--bg-page);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  color: var(--text-primary);
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: all 0.2s ease;
}

.input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-bg);
}

.textarea {
  resize: vertical;
  min-height: 100px;
  line-height: 1.5;
}

.actions {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid var(--border-default);
}

.btn-delete {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  border-radius: var(--radius-sm);
  background: var(--bg-page);
  border: 1px solid var(--border-default);
  color: var(--danger);
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: 13px;
}

.btn-delete:hover {
  background: var(--danger-bg);
  border-color: var(--danger);
}

/* Slide Transition */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(110%);
}
</style>
