<script setup lang="ts">
import { ref, nextTick, onMounted, watch } from 'vue'
import MessageBubble from './MessageBubble.vue'
import InputArea from './InputArea.vue'
import { agentApi } from '../../api/agent'
import type { ChatSession, ChatMessage, MessageSource } from '../../types'

// Props
const props = defineProps<{
  session: ChatSession
}>()

// 消息列表
const messages = ref<ChatMessage[]>([])
// 发送中状态
const sending = ref(false)

// 滚动到底部
const scrollToBottom = () => {
  const container = document.querySelector('.messages-area')
  if (container) {
    container.scrollTop = container.scrollHeight
  }
}

// 加载消息
const loadMessages = async () => {
  if (!props.session.id) return

  try {
    // 如果 session 已经包含消息，直接使用
    if (props.session.messages && props.session.messages.length > 0) {
      messages.value = props.session.messages
    } else {
      // 否则从 API 获取
      messages.value = await agentApi.getMessages(props.session.id)
    }
    console.log('[Chat] 加载消息:', messages.value.length)
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('[Chat] 加载消息失败:', error)
  }
}

// 发送消息
const handleSend = async (text: string) => {
  if (sending.value || !props.session.id) return

  sending.value = true

  // 先添加用户消息到界面（乐观更新）
  const tempUserMessage: ChatMessage = {
    id: `temp-${Date.now()}`,
    sessionId: props.session.id,
    role: 'user',
    content: text,
    createdAt: new Date().toISOString(),
  }
  messages.value.push(tempUserMessage)

  await nextTick()
  scrollToBottom()

  try {
    // 调用 API 发送消息
    const response = await agentApi.chat(props.session.id, { content: text })

    // 替换临时用户消息为真实消息
    const tempIndex = messages.value.findIndex(m => m.id === tempUserMessage.id)
    if (tempIndex !== -1) {
      messages.value[tempIndex] = response.userMessage
    }

    // 添加 AI 回复
    messages.value.push(response.assistantMessage)
    console.log('[Chat] 收到 AI 回复:', response.assistantMessage.content.substring(0, 50))

    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('[Chat] 发送消息失败:', error)
    // 移除临时消息
    messages.value = messages.value.filter(m => m.id !== tempUserMessage.id)
    // 显示错误提示
    messages.value.push({
      id: `error-${Date.now()}`,
      sessionId: props.session.id,
      role: 'assistant',
      content: '抱歉，发送消息失败，请稍后重试。',
      createdAt: new Date().toISOString(),
    })
  } finally {
    sending.value = false
  }
}

// 格式化来源信息
const formatSources = (sources?: MessageSource[]): string[] | undefined => {
  if (!sources || sources.length === 0) return undefined
  return sources.map(s => s.title)
}

// 监听 session 变化
watch(() => props.session.id, () => {
  loadMessages()
}, { immediate: true })

// 初始化
onMounted(() => {
  loadMessages()
})
</script>

<template>
  <div class="chat-window">
    <div class="messages-area">
      <!-- 欢迎消息（如果没有消息） -->
      <div v-if="messages.length === 0" class="welcome-message">
        <div class="welcome-icon">🤖</div>
        <h3>你好！我是 AI 助手</h3>
        <p>有什么我可以帮助你的吗？</p>
      </div>

      <!-- 消息列表 -->
      <MessageBubble
        v-for="msg in messages"
        :key="msg.id"
        :id="msg.id"
        :role="msg.role === 'user' ? 'user' : 'assistant'"
        :content="msg.content"
        :sources="formatSources(msg.sources)"
      />

      <!-- 发送中提示 -->
      <div v-if="sending" class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>

    <div class="input-wrapper">
      <InputArea @send="handleSend" :disabled="sending" />
    </div>
  </div>
</template>

<style scoped>
.chat-window {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.messages-area {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.input-wrapper {
  padding: 24px;
  background: linear-gradient(to top, var(--bg-dark) 80%, transparent);
  margin-bottom: 20px;
}

/* 欢迎消息 */
.welcome-message {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-muted);
}

.welcome-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.welcome-message h3 {
  font-size: 20px;
  color: var(--text-main);
  margin: 0 0 8px 0;
}

.welcome-message p {
  margin: 0;
  font-size: 14px;
}

/* 输入中动画 */
.typing-indicator {
  display: flex;
  gap: 6px;
  padding: 16px 20px;
  background: var(--glass-bg);
  border-radius: 16px;
  width: fit-content;
}

.typing-dot {
  width: 8px;
  height: 8px;
  background: var(--text-muted);
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dot:nth-child(1) {
  animation-delay: 0s;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-8px);
    opacity: 1;
  }
}
</style>
