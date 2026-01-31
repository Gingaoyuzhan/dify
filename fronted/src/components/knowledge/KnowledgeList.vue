<script setup lang="ts">
import { FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-vue-next'

interface Doc {
  id: string
  name: string
  size: string
  status: 'indexing' | 'ready' | 'error'
  chunks: number
  updatedAt: string
}

defineProps<{
  documents: Doc[]
}>()

const statusColor = (status: string) => {
  switch (status) {
    case 'ready': return '#10b981'
    case 'error': return '#ef4444'
    case 'indexing': return '#fbbf24'
    default: return '#94a3b8'
  }
}
</script>

<template>
  <div class="docs-list">
    <div v-for="doc in documents" :key="doc.id" class="doc-item glass-panel">
      <div class="doc-icon">
        <FileText :size="20" />
      </div>
      
      <div class="doc-info">
        <div class="doc-header">
          <span class="doc-name">{{ doc.name }}</span>
          <span class="doc-meta">{{ doc.size }} • {{ doc.updatedAt }}</span>
        </div>
        <div class="doc-stats">
          <span class="chunks-count">{{ doc.chunks }} chunks</span>
        </div>
      </div>
      
      <div class="doc-status" :style="{ color: statusColor(doc.status) }">
        <CheckCircle2 v-if="doc.status === 'ready'" :size="18" />
        <AlertCircle v-else-if="doc.status === 'error'" :size="18" />
        <Loader2 v-else-if="doc.status === 'indexing'" :size="18" class="spin" />
        <span class="status-text">{{ doc.status }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.docs-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.doc-item {
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 16px;
  border-radius: 12px;
  transition: transform 0.2s ease;
}

.doc-item:hover {
  transform: translateX(4px);
  background: rgba(255, 255, 255, 0.08);
}

.doc-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.doc-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.doc-name {
  font-weight: 500;
  color: var(--text-main);
  margin-right: 8px;
}

.doc-meta {
  font-size: 12px;
  color: var(--text-muted);
}

.doc-stats {
  font-size: 12px;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 6px;
  border-radius: 4px;
  width: fit-content;
}

.doc-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  text-transform: capitalize;
}

.spin {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
