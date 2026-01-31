<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Bot, Layers, Database, Sun, Moon, LogOut } from 'lucide-vue-next'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const isDark = ref(false)

const navItems = [
  { name: 'Workflow', path: '/workflow', icon: Layers },
  { name: 'Knowledge', path: '/knowledge', icon: Database },
  { name: 'Agent', path: '/agent', icon: Bot },
]

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme') || 'light'
  isDark.value = savedTheme === 'dark'
  document.documentElement.setAttribute('data-theme', savedTheme)
})
</script>

<template>
  <div class="layout-container">
    <aside class="sidebar">
      <div class="sidebar-top">
        <div class="brand">
          <div class="logo-box">C</div>
          <span class="brand-text">Coze Lite</span>
        </div>
      </div>
      
      <nav class="nav-menu">
        <button 
          v-for="item in navItems" 
          :key="item.path"
          class="nav-item"
          :class="{ active: route.path.startsWith(item.path) }"
          @click="router.push(item.path)"
        >
          <component :is="item.icon" :size="20" />
          <span class="nav-label">{{ item.name }}</span>
        </button>
      </nav>

      <div class="sidebar-footer">
        <button class="nav-item" @click="toggleTheme">
          <Moon v-if="isDark" :size="20" />
          <Sun v-else :size="20" />
          <span class="nav-label">{{ isDark ? 'Dark Mode' : 'Light Mode' }}</span>
        </button>
        <div class="divider"></div>
        <div class="user-profile">
          <div class="avatar">U</div>
          <div class="user-info">
            <span class="name">User</span>
            <span class="role">Admin</span>
          </div>
          <LogOut :size="16" class="logout-icon" />
        </div>
      </div>
    </aside>
    
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: var(--bg-page);
}

.sidebar {
  width: var(--sidebar-width);
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-surface);
  border-right: 1px solid var(--border-default);
  padding: 24px 16px;
  transition: all 0.3s ease;
}

.sidebar-top {
  margin-bottom: 32px;
  padding: 0 8px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-box {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--primary), #818cf8);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  font-size: 18px;
  box-shadow: var(--shadow-md);
}

.brand-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.5px;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
}

.nav-item:hover {
  background: var(--bg-surface-hover);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--primary-bg);
  color: var(--primary);
}

.sidebar-footer {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.divider {
  height: 1px;
  background: var(--border-default);
  margin: 4px 0;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.user-profile:hover {
  background: var(--bg-surface-hover);
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-surface-active);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.role {
  font-size: 11px;
  color: var(--text-tertiary);
}

.logout-icon {
  color: var(--text-tertiary);
}

.main-content {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: var(--bg-page);
}
</style>
