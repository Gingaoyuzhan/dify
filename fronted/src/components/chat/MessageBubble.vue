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
        <User :size="24" stroke-width="2.5" />
      </div>
      <div v-else class="avatar-inner bot-icon">
        <Sparkles :size="24" stroke-width="2.5" />
      </div>
    </div>
    
    <div class="message-group">
      <div class="sender-name">{{ role === 'user' ? 'USER' : 'SYSTEM AI' }}</div>
      <div class="bubble">
        <div v-if="content" v-html="parsedContent" class="markdown-body"></div>
        <div v-if="isTyping && !content" class="typing-indicator">
          <span></span><span></span><span></span>
        </div>
      </div>
      
      <div v-if="sources && sources.length > 0" class="sources-panel">
        <span class="sources-label">SOURCES:</span>
        <div class="source-tags">
          <span v-for="source in sources" :key="source" class="source-tag">
            {{ source.toUpperCase() }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.message-row {
  display: flex;
  gap: 24px;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}

.message-row.user {
  flex-direction: row-reverse;
}

.avatar {
  flex-shrink: 0;
  margin-top: 8px; /* Align with top of bubble or name? Bubble top seems better */
}

.avatar-inner {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: var(--border-width) solid var(--color-black);
  background: var(--color-white);
  box-shadow: 4px 4px 0 0 var(--color-black);
}

.user-icon {
  background: var(--color-primary); /* Yellow */
}

.bot-icon {
  background: var(--color-accent-pink);
  color: var(--color-black);
}

.message-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 75%;
}

.sender-name {
  font-size: 13px;
  font-weight: 900;
  color: var(--color-black);
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.user .sender-name {
  text-align: right;
}

.bubble {
  padding: 24px;
  border: var(--border-width) solid var(--color-black);
  line-height: 1.6;
  font-size: 16px;
  font-weight: 500;
  position: relative;
}

/* Assistant Bubble */
.assistant .bubble {
  background: var(--color-white);
  color: var(--color-black);
  box-shadow: 8px 8px 0 0 var(--color-black);
}

/* User Bubble - High Contrast Fix */
.user .bubble {
  background: var(--color-black);
  color: var(--color-white);
  /* White border for separation if on dark bg, but here on light bg black is fine.
     Let's add a white shadow for "pop" effect on dark themes, or just simple flat black. */
  box-shadow: -8px 8px 0 0 rgba(0,0,0,0.15); 
  border-color: var(--color-black);
}

/* Typing Indicator */
.typing-indicator {
  display: flex;
  gap: 8px;
  padding: 4px 0;
}

.typing-indicator span {
  width: 10px;
  height: 10px;
  background: var(--color-black);
  animation: bounce 1.4s infinite ease-in-out both;
  border: 2px solid transparent; /* placeholder */
}

.user .typing-indicator span {
  background: var(--color-white);
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* Sources */
.sources-panel {
  margin-top: 16px;
  padding: 12px 16px;
  background: var(--bg-surface-secondary);
  border: 2px solid var(--color-black);
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.sources-label {
  color: var(--color-black);
  font-weight: 900;
}

.source-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.source-tag {
  background: var(--color-white);
  padding: 4px 10px;
  border: 2px solid var(--color-black);
  color: var(--color-black);
  font-weight: 700;
  font-family: monospace;
  font-size: 11px;
}

.source-tag:hover {
  background: var(--color-primary);
  cursor: help;
}

/* Local Markdown Styles */
:deep(.markdown-body p) {
  margin: 0 0 16px 0;
}

:deep(.markdown-body p:last-child) {
  margin: 0;
}

:deep(.markdown-body strong) {
  font-weight: 900;
  color: inherit;
  text-decoration: underline;
  text-decoration-thickness: 2px;
}

:deep(.markdown-body ul) {
  padding-left: 20px;
  margin: 0 0 16px 0;
}

:deep(.markdown-body li) {
  margin-bottom: 8px;
}
</style>
