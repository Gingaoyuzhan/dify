<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import ChatWindow from '../components/chat/ChatWindow.vue'
import { agentApi } from '../api/agent'
import { workflowApi } from '../api/workflow'
import type { ChatSession, Workflow } from '../types'

// 会话列表
const sessions = ref<ChatSession[]>([])
// 当前会话
const currentSession = ref<ChatSession | null>(null)
// 工作流列表（用于创建会话时选择）
const workflows = ref<Workflow[]>([])
// 加载状态
const loading = ref(false)
// 显示新建会话对话框
const showNewSessionModal = ref(false)
// 新会话选择的工作流
const selectedWorkflowId = ref<string>('')
// 新会话标题
const newSessionTitle = ref('')

// 当前会话的工作流名称
const currentWorkflowName = computed(() => {
  if (!currentSession.value?.workflowId) return '无工作流'
  const workflow = workflows.value.find(w => w.id === currentSession.value?.workflowId)
  return workflow?.name || '未知工作流'
})

// 加载会话列表
const loadSessions = async () => {
  try {
    sessions.value = await agentApi.getAllSessions()
    console.log('[Agent] 加载会话列表:', sessions.value.length)
  } catch (error) {
    console.error('[Agent] 加载会话失败:', error)
  }
}

// 加载工作流列表
const loadWorkflows = async () => {
  try {
    workflows.value = await workflowApi.getAll()
    console.log('[Agent] 加载工作流列表:', workflows.value.length)
  } catch (error) {
    console.error('[Agent] 加载工作流失败:', error)
  }
}

// 选择会话
const selectSession = async (session: ChatSession) => {
  loading.value = true
  try {
    // 获取完整会话信息（包含消息）
    currentSession.value = await agentApi.getSession(session.id)
    console.log('[Agent] 选择会话:', currentSession.value.id)
  } catch (error) {
    console.error('[Agent] 获取会话详情失败:', error)
  } finally {
    loading.value = false
  }
}

// 创建新会话
const createSession = async () => {
  loading.value = true
  try {
    const newSession = await agentApi.createSession({
      workflowId: selectedWorkflowId.value || undefined,
      title: newSessionTitle.value || undefined,
    })
    sessions.value.unshift(newSession)
    currentSession.value = newSession
    showNewSessionModal.value = false
    selectedWorkflowId.value = ''
    newSessionTitle.value = ''
    console.log('[Agent] 创建新会话:', newSession.id)
  } catch (error) {
    console.error('[Agent] 创建会话失败:', error)
  } finally {
    loading.value = false
  }
}

// 删除会话
const deleteSession = async (session: ChatSession, event: Event) => {
  event.stopPropagation()
  if (!confirm('确定要删除这个会话吗？')) return

  try {
    await agentApi.deleteSession(session.id)
    sessions.value = sessions.value.filter(s => s.id !== session.id)
    if (currentSession.value?.id === session.id) {
      currentSession.value = null
    }
    console.log('[Agent] 删除会话:', session.id)
  } catch (error) {
    console.error('[Agent] 删除会话失败:', error)
  }
}

// 格式化时间
const formatTime = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 初始化
onMounted(async () => {
  await Promise.all([loadSessions(), loadWorkflows()])
  // 如果有会话，默认选择第一个
  if (sessions.value.length > 0) {
    const firstSession = sessions.value[0]
    if (firstSession) {
      await selectSession(firstSession)
    }
  }
})
</script>

<template>
  <div class="agent-view">
    <!-- 侧边栏：会话列表 -->
    <div class="sidebar">
      <div class="sidebar-header">
        <h3>对话列表</h3>
        <button class="btn-new" @click="showNewSessionModal = true">
          <span class="icon">+</span>
          新对话
        </button>
      </div>

      <div class="session-list">
        <div
          v-for="session in sessions"
          :key="session.id"
          class="session-item"
          :class="{ active: currentSession?.id === session.id }"
          @click="selectSession(session)"
        >
          <div class="session-info">
            <div class="session-title">{{ session.title || '新对话' }}</div>
            <div class="session-time">{{ formatTime(session.createdAt) }}</div>
          </div>
          <button class="btn-delete" @click="deleteSession(session, $event)">×</button>
        </div>

        <div v-if="sessions.length === 0" class="empty-tip">
          暂无对话，点击上方按钮创建
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <div class="header">
        <div class="header-info">
          <h1>Agent 对话</h1>
          <p v-if="currentSession">
            当前工作流: <span class="workflow-name">{{ currentWorkflowName }}</span>
          </p>
          <p v-else>选择或创建一个对话开始</p>
        </div>
      </div>

      <div class="chat-container">
        <ChatWindow
          v-if="currentSession"
          :session="currentSession"
          :key="currentSession.id"
        />
        <div v-else class="no-session">
          <div class="no-session-content">
            <div class="icon">💬</div>
            <p>选择一个对话或创建新对话</p>
            <button class="btn-primary" @click="showNewSessionModal = true">
              创建新对话
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 新建会话对话框 -->
    <div v-if="showNewSessionModal" class="modal-overlay" @click.self="showNewSessionModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>创建新对话</h3>
          <button class="btn-close" @click="showNewSessionModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>对话标题（可选）</label>
            <input
              v-model="newSessionTitle"
              type="text"
              placeholder="输入对话标题..."
            />
          </div>
          <div class="form-group">
            <label>选择工作流（可选）</label>
            <select v-model="selectedWorkflowId">
              <option value="">不使用工作流</option>
              <option v-for="wf in workflows" :key="wf.id" :value="wf.id">
                {{ wf.name }}
              </option>
            </select>
            <p class="hint">选择工作流后，对话将使用该工作流的逻辑处理消息</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showNewSessionModal = false">取消</button>
          <button class="btn-primary" @click="createSession" :disabled="loading">
            {{ loading ? '创建中...' : '创建' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.agent-view {
  height: 100vh;
  display: flex;
}

/* 侧边栏 */
.sidebar {
  width: 280px;
  background: var(--glass-bg);
  border-right: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid var(--glass-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 16px;
  color: var(--text-main);
}

.btn-new {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: var(--accent-primary);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.2s;
}

.btn-new:hover {
  background: var(--accent-secondary);
}

.btn-new .icon {
  font-size: 16px;
  font-weight: bold;
}

.session-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.session-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  margin-bottom: 4px;
}

.session-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.session-item.active {
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid var(--accent-primary);
}

.session-info {
  flex: 1;
  min-width: 0;
}

.session-title {
  font-size: 14px;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-time {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
}

.btn-delete {
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: 4px;
  font-size: 16px;
  opacity: 0;
  transition: all 0.2s;
}

.session-item:hover .btn-delete {
  opacity: 1;
}

.btn-delete:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.empty-tip {
  text-align: center;
  color: var(--text-muted);
  padding: 40px 20px;
  font-size: 14px;
}

/* 主内容区 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.header {
  padding: 24px 32px;
  border-bottom: 1px solid var(--glass-border);
}

.header-info h1 {
  font-size: 24px;
  margin: 0 0 4px 0;
  color: var(--text-main);
}

.header-info p {
  margin: 0;
  color: var(--text-muted);
  font-size: 14px;
}

.workflow-name {
  color: var(--accent-primary);
  font-weight: 500;
}

.chat-container {
  flex: 1;
  overflow: hidden;
  max-width: 1000px;
  width: 100%;
  margin: 0 auto;
}

.no-session {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-session-content {
  text-align: center;
  color: var(--text-muted);
}

.no-session-content .icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.no-session-content p {
  margin-bottom: 20px;
}

/* 按钮样式 */
.btn-primary {
  padding: 10px 20px;
  background: var(--accent-primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: var(--accent-secondary);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 10px 20px;
  background: transparent;
  color: var(--text-main);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.05);
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--bg-dark);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  width: 400px;
  max-width: 90vw;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--glass-border);
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: var(--text-main);
}

.btn-close {
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: 6px;
  font-size: 20px;
  transition: all 0.2s;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-main);
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  font-size: 14px;
  color: var(--text-main);
  margin-bottom: 8px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  color: var(--text-main);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  border-color: var(--accent-primary);
}

.form-group .hint {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 6px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid var(--glass-border);
}
</style>
