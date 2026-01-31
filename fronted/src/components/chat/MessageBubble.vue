<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'
import { User, Sparkles } from 'lucide-vue-next'

const props = defineProps<{
  role: 'user' | 'assistant'
  content: string
  sources?: string[]
  isTyping?: boolean
}>()

const parsedContent = computed(() => {
  return marked(props.content)
})
</script>

<template>
  <div class="message-row" :class="role">
    <div class="avatar">
      <div v-if="role === 'user'" class="avatar-inner user-icon">
        <User :size="18" />
      </div>
      <div v-else class="avatar-inner bot-icon">
        <Sparkles :size="18" />
      </div>
    </div>
    
    <div class="message-group">
      <div class="sender-name">{{ role === 'user' ? 'You' : 'AI Assistant' }}</div>
      <div class="bubble">
        <div v-if="content" v-html="parsedContent" class="markdown-body"></div>
        <div v-if="isTyping && !content" class="typing-indicator">
          <span></span><span></span><span></span>
        </div>
      </div>
      
      <div v-if="sources && sources.length > 0" class="sources-panel">
        <span class="sources-label">Citations:</span>
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
  flex-shrink: 0;
  margin-top: 2px;
}

.avatar-inner {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
}

.user-icon {
  background: var(--bg-surface-active);
  color: var(--text-primary);
}

.bot-icon {
  background: linear-gradient(135deg, var(--primary), #8b5cf6);
  color: white;
}

.message-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 85%;
}

.sender-name {
  font-size: 12px;
  color: var(--text-tertiary);
  margin-left: 2px;
}

.user .sender-name {
  text-align: right;
  margin-right: 2px;
}

.bubble {
  padding: 12px 16px;
  border-radius: var(--radius-md);
  line-height: 1.6;
  font-size: 15px;
  box-shadow: var(--shadow-sm);
  position: relative;
}

.assistant .bubble {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  color: var(--text-primary);
  border-top-left-radius: 2px;
}

.user .bubble {
  background: var(--primary);
  color: white;
  border-top-right-radius: 2px;
}

/* Typing Indicator */
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 4px 0;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  background: var(--text-tertiary);
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* Sources */
.sources-panel {
  margin-top: 8px;
  padding: 8px 12px;
  background: var(--bg-surface-hover);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--primary);
  font-size: 12px;
}

.sources-label {
  color: var(--text-secondary);
  font-weight: 500;
  margin-right: 8px;
}

.source-tags {
  display: inline-flex;
  gap: 6px;
  flex-wrap: wrap;
}

.source-tag {
  background: var(--bg-page);
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--text-primary);
  border: 1px solid var(--border-default);
}

/* Local Markdown Styles */
:deep(.markdown-body p) {
  margin: 0 0 12px 0;
}

:deep(.markdown-body p:last-child) {
  margin: 0;
}
</style>
