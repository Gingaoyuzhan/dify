<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, Settings, Trash2 } from 'lucide-vue-next'
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
    <aside v-if="node" class="properties-panel glass-panel">
      <div class="panel-header">
        <div class="header-title">
          <Settings :size="16" />
          <span>Properties</span>
        </div>
        <button class="icon-btn" @click="$emit('close')">
          <X :size="16" />
        </button>
      </div>
      
      <div class="panel-content">
        <div class="form-group">
          <label>Node ID</label>
          <input type="text" :value="node.id" disabled class="input disabled" />
        </div>
        
        <div class="form-group">
          <label>Label</label>
          <input 
            v-model="formData.label" 
            type="text" 
            class="input" 
            @input="saveChanges"
          />
        </div>
        
        <div class="form-group">
          <label>Description</label>
          <textarea 
            v-model="formData.description" 
            class="input textarea" 
            rows="3"
            @input="saveChanges"
          ></textarea>
        </div>

        <div class="divider"></div>

        <button class="btn-delete" @click="deleteNode">
          <Trash2 :size="14" />
          <span>Delete Node</span>
        </button>
      </div>
    </aside>
  </transition>
</template>

<style scoped>
.properties-panel {
  width: 300px;
  height: calc(100vh - 40px);
  position: absolute;
  right: 20px;
  top: 20px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  z-index: 20;
}

.panel-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--glass-border);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--text-main);
}

.panel-content {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
}

.input {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 8px 12px;
  color: var(--text-main);
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: all 0.2s ease;
}

.input:focus {
  border-color: var(--primary);
  background: rgba(0, 0, 0, 0.4);
}

.input.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.textarea {
  resize: vertical;
  min-height: 80px;
}

.divider {
  height: 1px;
  background: var(--glass-border);
  margin: 10px 0;
}

.btn-delete {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  border-radius: 6px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #ef4444;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.btn-delete:hover {
  background: rgba(239, 68, 68, 0.2);
}

/* Slide Transition */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
