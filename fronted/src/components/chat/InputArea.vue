<script setup lang="ts">
import { ref } from 'vue'
import { Send, Paperclip, Mic } from 'lucide-vue-next'

// Props
const props = withDefaults(defineProps<{
  disabled?: boolean
}>(), {
  disabled: false
})

const emit = defineEmits<{
  (e: 'send', text: string): void
}>()

const input = ref('')

const send = () => {
  if (!input.value.trim() || props.disabled) return
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
  <div class="input-container glass-panel" :class="{ disabled }">
    <div class="input-actions">
      <button class="icon-btn" :disabled="disabled">
        <Paperclip :size="20" />
      </button>
    </div>

    <textarea
      v-model="input"
      placeholder="输入消息..."
      class="chat-input"
      rows="1"
      :disabled="disabled"
      @keydown="onKeydown"
    ></textarea>

    <div class="input-actions right">
      <button class="icon-btn" v-if="!input" :disabled="disabled">
        <Mic :size="20" />
      </button>
      <button class="icon-btn send-btn" v-else @click="send" :disabled="disabled">
        <Send :size="18" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.input-container {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 24px;
  margin: 0 auto;
  width: 100%;
  max-width: 800px;
  transition: all 0.2s ease;
}

.input-container:focus-within {
  border-color: var(--primary);
  background: rgba(30, 41, 59, 0.8);
}

.chat-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-main);
  font-family: inherit;
  font-size: 15px;
  resize: none;
  min-height: 24px;
  max-height: 150px;
  padding: 4px 0;
  line-height: 1.5;
  outline: none;
}

.chat-input::placeholder {
  color: var(--text-muted);
}

.input-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 2px;
}

.send-btn {
  background: var(--primary);
  color: white;
  padding: 8px;
  border-radius: 50%;
}

.send-btn:hover {
  background: #4f46e5;
  transform: scale(1.05);
}

/* 禁用状态 */
.input-container.disabled {
  opacity: 0.6;
  pointer-events: none;
}
</style>
