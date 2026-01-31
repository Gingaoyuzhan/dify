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
    class="upload-zone glass-panel"
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
      <div class="icon-wrapper">
        <UploadCloud :size="24" />
      </div>
      <p class="title">Click or drag files to upload</p>
      <p class="subtitle">Supports PDF, TXT, MD, DOCX</p>
    </div>
  </div>
</template>

<style scoped>
.upload-zone {
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.upload-zone:hover, .upload-zone.dragging {
  border-color: var(--primary);
  background: rgba(99, 102, 241, 0.1);
}

.hidden-input {
  display: none;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  pointer-events: none; /* Let parent handle clicks */
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  margin-bottom: 8px;
}

.title {
  margin: 0;
  font-weight: 500;
  color: var(--text-main);
}

.subtitle {
  margin: 0;
  font-size: 13px;
  color: var(--text-muted);
}
</style>
