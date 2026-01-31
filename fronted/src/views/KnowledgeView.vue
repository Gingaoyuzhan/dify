<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Trash2, FileText, Database } from 'lucide-vue-next'
import UploadZone from '../components/knowledge/UploadZone.vue'
import { knowledgeApi } from '../api'
import type { KnowledgeBase, KnowledgeDocument } from '../types'

// -- State --
const knowledgeBases = ref<KnowledgeBase[]>([])
const currentBase = ref<KnowledgeBase | null>(null)
const documents = ref<KnowledgeDocument[]>([])
const isLoading = ref(false)
const showCreateModal = ref(false)
const showAddDocModal = ref(false)
const newBaseName = ref('')
const newBaseDesc = ref('')
const newDocTitle = ref('')
const newDocContent = ref('')

// -- API 操作 --

/** 加载知识库列表 */
const loadKnowledgeBases = async () => {
  try {
    isLoading.value = true
    knowledgeBases.value = await knowledgeApi.getAllBases()
    if (knowledgeBases.value.length > 0 && !currentBase.value) {
      const firstBase = knowledgeBases.value[0]
      if (firstBase) {
        await selectBase(firstBase)
      }
    }
  } catch (error) {
    console.error('加载知识库失败:', error)
  } finally {
    isLoading.value = false
  }
}

/** 选择知识库 */
const selectBase = async (base: KnowledgeBase) => {
  currentBase.value = base
  try {
    documents.value = await knowledgeApi.getDocuments(base.id)
  } catch (error) {
    console.error('加载文档失败:', error)
    documents.value = []
  }
}

/** 创建知识库 */
const createKnowledgeBase = async () => {
  if (!newBaseName.value.trim()) {
    alert('请输入知识库名称')
    return
  }

  try {
    const created = await knowledgeApi.createBase({
      name: newBaseName.value,
      description: newBaseDesc.value
    })
    knowledgeBases.value.unshift(created)
    await selectBase(created)
    showCreateModal.value = false
    newBaseName.value = ''
    newBaseDesc.value = ''
  } catch (error) {
    console.error('创建知识库失败:', error)
    alert('创建知识库失败')
  }
}

/** 删除知识库 */
const deleteKnowledgeBase = async (base: KnowledgeBase) => {
  if (!confirm(`确定要删除知识库 "${base.name}" 吗？`)) return

  try {
    await knowledgeApi.deleteBase(base.id)
    knowledgeBases.value = knowledgeBases.value.filter(b => b.id !== base.id)
    if (currentBase.value?.id === base.id) {
      currentBase.value = knowledgeBases.value[0] || null
      if (currentBase.value) {
        await selectBase(currentBase.value)
      } else {
        documents.value = []
      }
    }
  } catch (error) {
    console.error('删除知识库失败:', error)
    alert('删除知识库失败')
  }
}

/** 添加文档 */
const addDocument = async () => {
  if (!currentBase.value) {
    alert('请先选择知识库')
    return
  }

  if (!newDocTitle.value.trim() || !newDocContent.value.trim()) {
    alert('请输入文档标题和内容')
    return
  }

  try {
    const created = await knowledgeApi.addDocument(currentBase.value.id, {
      title: newDocTitle.value,
      content: newDocContent.value
    })
    documents.value.unshift(created)
    showAddDocModal.value = false
    newDocTitle.value = ''
    newDocContent.value = ''
  } catch (error) {
    console.error('添加文档失败:', error)
    alert('添加文档失败')
  }
}

/** 删除文档 */
const deleteDocument = async (docId: string) => {
  if (!confirm('确定要删除这个文档吗？')) return

  try {
    await knowledgeApi.deleteDocument(docId)
    documents.value = documents.value.filter(d => d.id !== docId)
  } catch (error) {
    console.error('删除文档失败:', error)
    alert('删除文档失败')
  }
}

/** 处理文件上传 */
const handleFiles = async (files: FileList) => {
  if (!currentBase.value) {
    alert('请先选择或创建知识库')
    return
  }

  for (const file of Array.from(files)) {
    try {
      const content = await file.text()
      const created = await knowledgeApi.addDocument(currentBase.value.id, {
        title: file.name,
        content: content,
        source: file.name
      })
      documents.value.unshift(created)
    } catch (error) {
      console.error(`上传文件 ${file.name} 失败:`, error)
    }
  }
}

// -- Lifecycle --
onMounted(() => {
  loadKnowledgeBases()
})
</script>

<template>
  <div class="knowledge-container">
    <div class="header">
      <h1>知识库管理</h1>
      <p>管理 RAG 检索的文档</p>
    </div>

    <div class="content-grid">
      <!-- 左侧：知识库列表 -->
      <div class="left-col">
        <div class="section-header">
          <h2>知识库</h2>
          <button class="btn btn-sm btn-primary" @click="showCreateModal = true">
            <Plus :size="14" />
            新建
          </button>
        </div>

        <div class="base-list">
          <div
            v-for="base in knowledgeBases"
            :key="base.id"
            class="base-item"
            :class="{ active: currentBase?.id === base.id }"
            @click="selectBase(base)"
          >
            <Database :size="16" class="base-icon" />
            <div class="base-info">
              <div class="base-name">{{ base.name }}</div>
              <div class="base-desc">{{ base.description || '暂无描述' }}</div>
            </div>
            <button class="delete-btn" @click.stop="deleteKnowledgeBase(base)">
              <Trash2 :size="12" />
            </button>
          </div>

          <div v-if="knowledgeBases.length === 0" class="empty-state">
            暂无知识库，点击"新建"创建
          </div>
        </div>

        <div class="upload-section" v-if="currentBase">
          <UploadZone @files-selected="handleFiles" />
        </div>
      </div>

      <!-- 右侧：文档列表 -->
      <div class="right-col">
        <div class="section-header">
          <div class="section-title">
            <h2>{{ currentBase?.name || '选择知识库' }}</h2>
            <span class="badge" v-if="currentBase">{{ documents.length }} 个文档</span>
          </div>
          <button
            v-if="currentBase"
            class="btn btn-sm btn-secondary"
            @click="showAddDocModal = true"
          >
            <FileText :size="14" />
            添加文档
          </button>
        </div>

        <div v-if="!currentBase" class="empty-state">
          请先选择或创建知识库
        </div>

        <div v-else-if="documents.length === 0" class="empty-state">
          暂无文档，上传文件或手动添加
        </div>

        <div v-else class="doc-list">
          <div v-for="doc in documents" :key="doc.id" class="doc-item">
            <FileText :size="20" class="doc-icon" />
            <div class="doc-info">
              <div class="doc-title">{{ doc.title }}</div>
              <div class="doc-meta">
                {{ Math.ceil(doc.content.length / 1024) }} KB ·
                {{ new Date(doc.createdAt).toLocaleString() }}
              </div>
            </div>
            <button class="delete-btn" @click="deleteDocument(doc.id)">
              <Trash2 :size="14" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建知识库弹窗 -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modal glass-panel">
        <div class="modal-header">
          <h3>创建知识库</h3>
          <button class="close-btn" @click="showCreateModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>名称</label>
            <input v-model="newBaseName" placeholder="输入知识库名称" />
          </div>
          <div class="form-group">
            <label>描述（可选）</label>
            <textarea v-model="newBaseDesc" placeholder="输入描述" rows="3"></textarea>
          </div>
          <button class="btn btn-primary btn-block" @click="createKnowledgeBase">
            创建
          </button>
        </div>
      </div>
    </div>

    <!-- 添加文档弹窗 -->
    <div v-if="showAddDocModal" class="modal-overlay" @click.self="showAddDocModal = false">
      <div class="modal glass-panel modal-lg">
        <div class="modal-header">
          <h3>添加文档</h3>
          <button class="close-btn" @click="showAddDocModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>标题</label>
            <input v-model="newDocTitle" placeholder="输入文档标题" />
          </div>
          <div class="form-group">
            <label>内容</label>
            <textarea v-model="newDocContent" placeholder="输入文档内容" rows="10"></textarea>
          </div>
          <button class="btn btn-primary btn-block" @click="addDocument">
            添加
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.knowledge-container {
  padding: 32px;
  height: 100vh;
  overflow-y: auto;
}

.header {
  margin-bottom: 32px;
}

.header h1 {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  background: linear-gradient(to right, #fff, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header p {
  color: var(--text-muted);
  font-size: 16px;
  margin: 0;
}

.content-grid {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 32px;
  max-width: 1400px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-header h2 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.badge {
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-sm {
  padding: 6px 10px;
  font-size: 12px;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-main);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-block {
  width: 100%;
  justify-content: center;
}

/* 知识库列表 */
.base-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.base-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.base-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.base-item.active {
  background: rgba(99, 102, 241, 0.1);
  border-color: var(--primary);
}

.base-icon {
  color: var(--primary);
  flex-shrink: 0;
}

.base-info {
  flex: 1;
  min-width: 0;
}

.base-name {
  font-weight: 500;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.base-desc {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.delete-btn {
  background: rgba(239, 68, 68, 0.2);
  border: none;
  color: #ef4444;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}

.base-item:hover .delete-btn,
.doc-item:hover .delete-btn {
  opacity: 1;
}

/* 文档列表 */
.doc-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.doc-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  transition: all 0.2s;
}

.doc-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.doc-icon {
  color: var(--text-muted);
  flex-shrink: 0;
}

.doc-info {
  flex: 1;
  min-width: 0;
}

.doc-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.doc-meta {
  font-size: 12px;
  color: var(--text-muted);
}

.empty-state {
  text-align: center;
  color: var(--text-muted);
  padding: 40px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
}

.upload-section {
  margin-top: 20px;
}

/* Modal */
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
  z-index: 100;
}

.modal {
  width: 400px;
  border-radius: 16px;
  overflow: hidden;
}

.modal-lg {
  width: 600px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 24px;
  cursor: pointer;
  line-height: 1;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--text-muted);
}

.form-group input,
.form-group textarea {
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 10px 12px;
  color: var(--text-main);
  font-size: 14px;
}

.form-group textarea {
  resize: vertical;
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
