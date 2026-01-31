<script setup lang="ts">
import { ref } from 'vue'
import { UploadCloud } from 'lucide-vue-next'

const emit = defineEmits<{
  (e: 'files-selected', files: FileList): void
}>()

const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const onDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = true
}

const onDragLeave = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false
}

const onDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false
  if (e.dataTransfer?.files) {
    emit('files-selected', e.dataTransfer.files)
  }
}

const onClick = () => {
  fileInput.value?.click()
}

const onFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files) {
    emit('files-selected', input.files)
  }
}
</script>

<template>
  <div 
    class="upload-zone"
    :class="{ dragging: isDragging }"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
    @click="onClick"
  >
    <input 
      ref="fileInput"
      type="file" 
      multiple 
      class="hidden-input"
      @change="onFileChange"
    />
    
    <div class="content">
      <div class="icon-circle">
        <UploadCloud :size="24" />
      </div>
      <div class="text-group">
        <p class="title">Upload documents</p>
        <p class="subtitle">Drag & drop or click to browse</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.upload-zone {
  border: 1px dashed var(--border-default);
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  padding: 32px;
  cursor: pointer;
  transition: all 0.2s ease;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-zone:hover, .upload-zone.dragging {
  border-color: var(--primary);
  background: var(--bg-surface-hover);
}

.hidden-input {
  display: none;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}

.icon-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--bg-surface-active);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.upload-zone:hover .icon-circle {
  background: var(--primary-bg);
  color: var(--primary);
  transform: scale(1.1);
}

.title {
  margin: 0 0 4px 0;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 15px;
}

.subtitle {
  margin: 0;
  font-size: 13px;
  color: var(--text-secondary);
}
</style>
