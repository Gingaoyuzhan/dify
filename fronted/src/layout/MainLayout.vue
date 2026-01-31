<script setup lang="ts">
import { Bot, Layers, Database } from 'lucide-vue-next'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const navItems = [
  { name: 'Workflow', path: '/workflow', icon: Layers },
  { name: 'Knowledge', path: '/knowledge', icon: Database },
  { name: 'Agent', path: '/agent', icon: Bot },
]
</script>

<template>
  <div class="layout-container">
    <aside class="sidebar glass-panel">
      <div class="logo-area flex-center">
        <div class="logo-icon">C</div>
        <span class="logo-text">Coze Lite</span>
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
          <span>{{ item.name }}</span>
        </button>
      </nav>
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
  background-color: transparent;
}

.sidebar {
  width: var(--sidebar-width);
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  border-right: 1px solid var(--glass-border);
  border-top: none;
  border-bottom: none;
  border-left: none;
  border-radius: 0;
  z-index: 10;
}

.logo-area {
  margin-bottom: 40px;
  gap: 12px;
}

.logo-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
  color: white;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
  background: linear-gradient(to right, #fff, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-main);
}

.nav-item.active {
  background: rgba(99, 102, 241, 0.15);
  color: var(--text-main);
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.main-content {
  flex: 1;
  position: relative;
  overflow: hidden;
}
</style>
