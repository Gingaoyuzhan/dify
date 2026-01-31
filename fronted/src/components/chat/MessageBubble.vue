<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'
import { User, Bot } from 'lucide-vue-next'

const props = defineProps<{
  role: 'user' | 'assistant'
  content: string
  sources?: string[]
}>()

const parsedContent = computed(() => {
  return marked(props.content)
})
</script>

<template>
  <div class="message-row" :class="role">
    <div class="avatar">
      <User v-if="role === 'user'" :size="20" />
      <Bot v-else :size="20" />
    </div>
    
    <div class="message-content glass-panel">
      <div v-html="parsedContent" class="markdown-body"></div>
      
      <div v-if="sources && sources.length > 0" class="sources">
        <span class="sources-label">Sources:</span>
        <div class="source-tags">
          <span v-for="source in sources" :key="source" class="source-tag">
            {{ source }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.message-row {
  display: flex;
  gap: 16px;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.message-row.user {
  flex-direction: row-reverse;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user .avatar {
  background: var(--secondary);
  color: white;
}

.assistant .avatar {
  background: var(--primary);
  color: white;
}

.message-content {
  padding: 12px 16px;
  border-radius: 12px;
  border-top-left-radius: 2px;
  color: var(--text-main);
  line-height: 1.6;
  font-size: 15px;
  max-width: 80%;
}

.user .message-content {
  background: var(--primary);
  border: none;
  border-radius: 12px;
  border-top-right-radius: 2px;
}

.sources {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 12px;
}

.sources-label {
  color: var(--text-muted);
  margin-right: 8px;
}

.source-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.source-tag {
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  color: var(--text-muted);
}

/* Local Markdown Styles */
:deep(.markdown-body p) {
  margin: 0 0 8px 0;
}

:deep(.markdown-body p:last-child) {
  margin: 0;
}

:deep(.markdown-body pre) {
  background: rgba(0, 0, 0, 0.3);
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
}

:deep(.markdown-body code) {
  font-family: monospace;
  background: rgba(0, 0, 0, 0.2);
  padding: 2px 4px;
  border-radius: 4px;
}
</style>
