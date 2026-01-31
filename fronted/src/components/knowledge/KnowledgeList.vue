<script setup lang="ts">
import { FileText, CheckCircle2, AlertCircle, Loader2, MoreVertical } from 'lucide-vue-next'

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
    case 'ready': return 'var(--success)'
    case 'error': return 'var(--danger)'
    case 'indexing': return 'var(--warning)'
    default: return 'var(--text-tertiary)'
  }
}

const statusBg = (status: string) => {
  switch (status) {
    case 'ready': return 'var(--success-bg)'
    case 'error': return 'var(--danger-bg)'
    case 'indexing': return 'var(--warning-bg)'
    default: return 'var(--bg-surface-active)'
  }
}
</script>

<template>
  <div class="docs-grid">
    <div v-for="doc in documents" :key="doc.id" class="doc-card">
      <div class="card-header">
        <div class="icon-wrapper">
          <FileText :size="20" />
        </div>
        <button class="menu-btn">
          <MoreVertical :size="16" />
        </button>
      </div>
      
      <div class="card-body">
        <h3 class="doc-name" :title="doc.name">{{ doc.name }}</h3>
        <p class="doc-meta">{{ doc.size }} • {{ doc.updatedAt }}</p>
      </div>
      
      <div class="card-footer">
        <div class="status-badge" :style="{ color: statusColor(doc.status), background: statusBg(doc.status) }">
          <CheckCircle2 v-if="doc.status === 'ready'" :size="12" />
          <AlertCircle v-else-if="doc.status === 'error'" :size="12" />
          <Loader2 v-else-if="doc.status === 'indexing'" :size="12" class="spin" />
          <span>{{ doc.status }}</span>
        </div>
        <span class="chunks">{{ doc.chunks }} chunks</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.docs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.doc-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: 16px;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
}

.doc-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--border-hover);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.icon-wrapper {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--primary-bg);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-btn {
  background: transparent;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.menu-btn:hover {
  background: var(--bg-surface-active);
  color: var(--text-primary);
}

.card-body {
  flex: 1;
  margin-bottom: 16px;
}

.doc-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.doc-meta {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid var(--border-default);
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: capitalize;
}

.spin {
  animation: spin 2s linear infinite;
}

.chunks {
  font-size: 12px;
  color: var(--text-tertiary);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
