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
    content: 'Hello! I am your AI assistant. How can I help you optimize your workflow today?',
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
    finalMsg.sources = ['Knowledge Base v1', 'System Docs']
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
  const responseText = `I understand you're asking about **"${text}"**.\n\nBased on the analysis, here are the key points:\n\n1. **Integration**: The system seamlessly connects with your existing stack.\n2. **Performance**: Optimized for low-latency responses.\n3. **Scalability**: Designed to grow with your data needs.\n\nWould you like to explore the *configuration options*?`
  
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
  background: var(--bg-page);
}

.messages-area {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.input-section {
  padding: 20px 24px 32px;
  background: linear-gradient(to top, var(--bg-page) 80%, transparent);
}
</style>
