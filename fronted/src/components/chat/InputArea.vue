<script setup lang="ts">
import { ref } from 'vue'
import { Send, Paperclip, Mic, Sparkles } from 'lucide-vue-next'

const emit = defineEmits<{
  (e: 'send', text: string): void
}>()

const input = ref('')

const send = () => {
  if (!input.value.trim()) return
  emit('send', input.value)
  input.value = ''
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}
</script>

<template>
  <div class="input-wrapper">
    <div class="input-container">
      <div class="toolbox left">
        <button class="tool-btn" title="Upload File">
          <Paperclip :size="18" />
        </button>
      </div>
      
      <textarea 
        v-model="input"
        placeholder="Send a message..." 
        class="chat-textarea"
        rows="1"
        @keydown="onKeydown"
      ></textarea>
      
      <div class="toolbox right">
        <button class="tool-btn" v-if="!input" title="Voice Input">
          <Mic :size="18" />
        </button>
        <button 
          class="send-btn" 
          v-else 
          @click="send"
          :disabled="!input.trim()"
        >
          <Send :size="16" />
        </button>
      </div>
    </div>
    
    <div class="footer-note">
      <Sparkles :size="12" />
      <span>AI can make mistakes. Please verify important information.</span>
    </div>
  </div>
</template>

<style scoped>
.input-wrapper {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.input-container {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 8px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-default);
  background: var(--bg-surface);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}

.input-container:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-bg);
}

.chat-textarea {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 15px;
  resize: none;
  min-height: 24px;
  max-height: 150px;
  padding: 8px 0;
  line-height: 1.5;
  outline: none;
}

.chat-textarea::placeholder {
  color: var(--text-tertiary);
}

.toolbox {
  display: flex;
  align-items: center;
  padding-bottom: 4px; /* Align with bottom of textarea */
}

.tool-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.tool-btn:hover {
  background: var(--bg-surface-hover);
  color: var(--text-primary);
}

.send-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: var(--primary);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.send-btn:hover {
  background: var(--primary-hover);
  transform: scale(1.05);
}

.send-btn:disabled {
  background: var(--bg-surface-active);
  color: var(--text-tertiary);
  cursor: not-allowed;
  transform: none;
}

.footer-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 12px;
  font-size: 11px;
  color: var(--text-tertiary);
}
</style>
