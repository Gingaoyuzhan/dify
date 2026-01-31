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
    class="neo-upload"
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
      <div class="icon-box">
        <UploadCloud :size="32" stroke-width="2.5" />
      </div>
      <div class="text-group">
        <p class="title">UPLOAD FILES</p>
        <p class="subtitle">DRAG & DROP OR CLICK TO BROWSE</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.neo-upload {
  border: 3px dashed var(--color-black);
  background: var(--bg-surface-secondary);
  padding: 32px;
  cursor: pointer;
  transition: all 0.2s ease;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.neo-upload:hover, .neo-upload.dragging {
  border-style: solid;
  background: var(--color-white);
  box-shadow: var(--shadow-hard);
  transform: translate(-4px, -4px);
}

.neo-upload:active {
  transform: translate(0, 0);
  box-shadow: none;
}

.hidden-input {
  display: none;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  text-align: center;
}

.icon-box {
  width: 64px;
  height: 64px;
  background: var(--color-white);
  border: var(--border-width) solid var(--color-black);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-black);
  box-shadow: 4px 4px 0 0 var(--color-black);
}

.title {
  margin: 0 0 6px 0;
  font-weight: 800;
  color: var(--color-black);
  font-size: 18px;
  letter-spacing: -0.5px;
}

.subtitle {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-secondary);
  font-family: monospace;
}
</style>
