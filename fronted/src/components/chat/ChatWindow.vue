<script setup lang="ts">
import { ref, nextTick } from 'vue'
import MessageBubble from './MessageBubble.vue'
import InputArea from './InputArea.vue'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: string[]
  isTyping?: boolean
}

const messages = ref<Message[]>([
  {
    id: '1',
    role: 'assistant',
    content: 'HELLO HUMANS! I AM READY TO PROCESS YOUR DATA.',
  }
])

const scrollToBottom = () => {
  const container = document.querySelector('.messages-area')
  if (container) {
    container.scrollTop = container.scrollHeight
  }
}

const simulateTyping = async (fullText: string, messageId: string) => {
  const msgIndex = messages.value.findIndex(m => m.id === messageId)
  if (msgIndex === -1) return

  const chunkDelay = 30 // ms per chunk
  const chunkSize = 3 // chars per chunk
  const msg = messages.value[msgIndex]
  if (!msg) return

  msg.isTyping = true

  for (let i = 0; i < fullText.length; i += chunkSize) {
    const currentMsg = messages.value[msgIndex]
    if (!currentMsg) break

    currentMsg.content += fullText.slice(i, i + chunkSize)
    scrollToBottom()
    await new Promise(resolve => setTimeout(resolve, chunkDelay))
  }

  const finalMsg = messages.value[msgIndex]
  if (finalMsg) {
    finalMsg.isTyping = false
    // Add sources at the end
    finalMsg.sources = ['DB-X1', 'SYS-LOGS']
  }
  await nextTick()
  scrollToBottom()
}

const handleSend = async (text: string) => {
  // Add user message
  messages.value.push({
    id: Date.now().toString(),
    role: 'user',
    content: text
  })
  
  await nextTick()
  scrollToBottom()
  
  // Simulate AI Response
  const responseId = (Date.now() + 1).toString()
  const responseText = `I HAVE ANALYZED YOUR QUERY: **"${text.toUpperCase()}"**.\n\nRESULTS:\n\n1. SYSTEM OPTIMAL.\n2. LATENCY ZERO.\n3. DEPLOYMENT READY.\n\nPROCEED WITH EXECUTION?`
  
  // Add placeholder for streaming
  messages.value.push({
    id: responseId,
    role: 'assistant',
    content: '',
    isTyping: true
  })
  
  await nextTick()
  scrollToBottom()
  
  // Start typing simulation after brief delay
  setTimeout(() => {
    simulateTyping(responseText, responseId)
  }, 600)
}
</script>

<template>
  <div class="chat-window">
    <div class="messages-area">
      <MessageBubble 
        v-for="msg in messages" 
        :key="msg.id" 
        v-bind="msg" 
      />
    </div>
    
    <div class="input-section">
      <InputArea @send="handleSend" />
    </div>
  </div>
</template>

<style scoped>
.chat-window {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-surface-secondary);
  /* Dotted paper background effect */
  background-image: radial-gradient(var(--text-secondary) 1px, transparent 1px);
  background-size: 20px 20px;
}

.messages-area {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.input-section {
  padding: 24px 32px 32px;
  background: var(--color-white);
  border-top: var(--border-width) solid var(--color-black);
}
</style>
