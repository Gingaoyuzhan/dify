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
    case 'ready': return 'var(--color-black)'
    case 'error': return 'var(--color-black)'
    case 'indexing': return 'var(--color-black)'
    default: return 'var(--text-secondary)'
  }
}

const statusBg = (status: string) => {
  switch (status) {
    case 'ready': return 'var(--color-accent-green)'
    case 'error': return 'var(--color-accent-pink)'
    case 'indexing': return 'var(--color-primary)'
    default: return 'var(--bg-surface-secondary)'
  }
}
</script>

<template>
  <div class="docs-grid">
    <div v-for="doc in documents" :key="doc.id" class="neo-card">
      <div class="card-header">
        <div class="icon-box">
          <FileText :size="20" stroke-width="2.5" />
        </div>
        <button class="menu-btn">
          <MoreVertical :size="20" stroke-width="2.5" />
        </button>
      </div>
      
      <div class="card-body">
        <h3 class="doc-name" :title="doc.name">{{ doc.name }}</h3>
        <p class="doc-meta">{{ doc.size }} • {{ doc.updatedAt }}</p>
      </div>
      
      <div class="card-footer">
        <div 
          class="status-pill" 
          :style="{ color: statusColor(doc.status), backgroundColor: statusBg(doc.status) }"
        >
          <CheckCircle2 v-if="doc.status === 'ready'" :size="14" stroke-width="3" />
          <AlertCircle v-else-if="doc.status === 'error'" :size="14" stroke-width="3" />
          <Loader2 v-else-if="doc.status === 'indexing'" :size="14" class="spin" stroke-width="3" />
          <span>{{ doc.status.toUpperCase() }}</span>
        </div>
        <div class="chunks-badge">{{ doc.chunks }} CHUNKS</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.docs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.neo-card {
  background: var(--color-white);
  border: var(--border-width) solid var(--color-black);
  box-shadow: var(--shadow-hard);
  padding: 20px;
  display: flex;
  flex-direction: column;
  transition: all 0.1s ease;
}

.neo-card:hover {
  transform: translate(-4px, -4px);
  box-shadow: var(--shadow-hard-hover);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.icon-box {
  width: 48px;
  height: 48px;
  background: var(--color-primary);
  border: var(--border-width) solid var(--color-black);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-black);
}

.menu-btn {
  background: transparent;
  border: 2px solid transparent;
  color: var(--color-black);
  cursor: pointer;
  padding: 4px;
}

.menu-btn:hover {
  border: 2px solid var(--color-black);
  background: var(--bg-surface-secondary);
}

.card-body {
  flex: 1;
  margin-bottom: 20px;
}

.doc-name {
  font-size: 18px;
  font-weight: 800;
  color: var(--color-black);
  margin: 0 0 8px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.5px;
}

.doc-meta {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 600;
  margin: 0;
  font-family: monospace;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: var(--border-width) dashed var(--color-black);
}

.status-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: var(--border-width) solid var(--color-black);
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}

.chunks-badge {
  font-family: monospace;
  font-size: 12px;
  font-weight: 700;
  background: var(--color-black);
  color: var(--color-white);
  padding: 4px 8px;
}

.spin {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
