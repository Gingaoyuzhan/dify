<script setup lang="ts">
import { ref } from 'vue'
import { Send, Paperclip, Mic, Sparkles } from 'lucide-vue-next'

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
  <div class="input-wrapper" :class="{ disabled }">
    <div class="neo-input-group">
      <button class="icon-btn left neo-press" title="Upload File" :disabled="disabled">
        <Paperclip :size="24" stroke-width="2.5" />
      </button>

      <textarea
        v-model="input"
        placeholder="TYPE COMMAND..."
        class="neo-textarea"
        rows="1"
        :disabled="disabled"
        @keydown="onKeydown"
      ></textarea>

      <div class="right-actions">
        <button class="icon-btn neo-press" v-if="!input" title="Voice Input" :disabled="disabled">
          <Mic :size="24" stroke-width="2.5" />
        </button>
        <button
          class="neo-send-btn neo-press"
          v-else
          @click="send"
          :disabled="!input.trim() || disabled"
        >
          <Send :size="24" stroke-width="2.5" />
        </button>
      </div>
    </div>

    <div class="footer-note">
      <Sparkles :size="14" stroke-width="2.5" />
      <span>AI GENERATED CONTENT. VERIFY OUTPUTS.</span>
    </div>
  </div>
</template>

<style scoped>
.input-wrapper {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

.neo-input-group {
  display: flex;
  align-items: center;
  gap: 0;
  background: var(--color-white);
  border: var(--border-width) solid var(--color-black);
  box-shadow: var(--shadow-hard);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  min-height: 64px;
}

.neo-input-group:focus-within {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 0 var(--color-black);
}

.neo-textarea {
  flex: 1;
  background: transparent;
  border: none;
  border-left: var(--border-width) solid var(--color-black);
  border-right: var(--border-width) solid var(--color-black);
  color: var(--color-black);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 18px; /* Larger text for impact */
  font-weight: 700;
  resize: none;
  padding: 18px 20px;
  line-height: 1.5;
  outline: none;
  text-transform: uppercase;
  height: 64px; /* Match button height */
}

.neo-textarea::placeholder {
  color: var(--text-secondary);
  font-weight: 600;
  opacity: 0.7;
}

.icon-btn {
  width: 64px;
  height: 64px; /* Square touch targets */
  border: none;
  background: transparent;
  color: var(--color-black);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
  background: var(--bg-surface-secondary);
}

.right-actions {
  width: 64px;
  height: 64px;
  display: flex;
}

.neo-send-btn {
  width: 100%;
  height: 100%;
  border: none;
  background: var(--color-primary);
  color: var(--color-black);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.neo-send-btn:hover {
  background: var(--color-primary-dark);
}

.neo-send-btn:disabled {
  background: var(--bg-surface-secondary);
  color: var(--text-secondary);
  cursor: not-allowed;
}

/* 禁用状态 */
.input-wrapper.disabled {
  opacity: 0.6;
  pointer-events: none;
}

.footer-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  font-size: 11px;
  font-weight: 800;
  color: var(--text-secondary);
  letter-spacing: 0.5px;
  opacity: 0.8;
}
</style>
