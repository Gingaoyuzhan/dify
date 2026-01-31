<script setup lang="ts">
import { Bot, Layers, Database, LogOut, Command, ChevronRight } from 'lucide-vue-next'
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
    <header class="top-nav">
      <div class="brand">
        <div class="logo-box">
          <Command :size="24" stroke-width="3" />
        </div>
        <span class="brand-text">COZE LITE</span>
      </div>
      
      <div class="header-actions">
        <div class="user-badge">
          <span>ADMIN</span>
        </div>
      </div>
    </header>
    
    <div class="content-wrapper">
      <aside class="sidebar">
        <nav class="nav-menu">
          <button 
            v-for="item in navItems" 
            :key="item.path"
            class="neo-nav-item neo-press"
            :class="{ active: route.path.startsWith(item.path) }"
            @click="router.push(item.path)"
          >
            <div class="icon-wrap">
              <component :is="item.icon" :size="20" stroke-width="2.5" />
            </div>
            <span class="nav-label">{{ item.name }}</span>
            <ChevronRight v-if="route.path.startsWith(item.path)" :size="16" stroke-width="4" class="active-arrow" />
          </button>
        </nav>

        <div class="sidebar-footer">
          <button class="neo-nav-item danger neo-press">
            <div class="icon-wrap">
              <LogOut :size="20" stroke-width="2.5" />
            </div>
            <span class="nav-label">LOGOUT</span>
          </button>
        </div>
      </aside>
      
      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background-color: var(--color-primary); 
}

.top-nav {
  height: var(--header-height);
  background: var(--bg-page);
  border-bottom: var(--border-width) solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 32px;
  z-index: 100;
}

.brand {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo-box {
  width: 42px;
  height: 42px;
  background: var(--color-primary);
  border: var(--border-width) solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 4px 4px 0 0 var(--border-color);
  color: var(--color-black);
}

.brand-text {
  font-size: 24px;
  font-weight: 900;
  letter-spacing: -1px;
  text-transform: uppercase;
  color: var(--text-primary);
}

.header-actions {
  display: flex;
  gap: 20px;
  align-items: center;
}

.neo-btn.small {
  padding: 8px 16px;
  font-size: 13px;
  height: 40px;
}

.user-badge {
  background: var(--color-black);
  color: var(--color-white);
  padding: 8px 16px;
  font-weight: 700;
  font-size: 13px;
  border: var(--border-width) solid var(--border-color);
  height: 40px;
  display: flex;
  align-items: center;
}

.content-wrapper {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sidebar {
  width: var(--sidebar-width);
  background: var(--bg-page);
  border-right: var(--border-width) solid var(--border-color);
  display: flex;
  flex-direction: column;
  padding: 32px 24px;
  gap: 24px;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.neo-nav-item {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
  padding: 16px;
  background: var(--bg-page);
  border: var(--border-width) solid var(--border-color);
  width: 100%;
  text-align: left;
  position: relative;
  
  /* Reset button styles */
  font-family: inherit;
  cursor: pointer;
  color: var(--text-primary);
}

.nav-label {
  font-weight: 800;
  font-size: 15px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex: 1;
}

.icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}

.active-arrow {
  animation: slideIn 0.2s ease-out;
}

/* Hover State */
.neo-nav-item:hover {
  background: var(--bg-surface-secondary);
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0 0 var(--border-color);
}

/* Active State */
.neo-nav-item.active {
  background: var(--color-primary);
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0 0 var(--border-color);
}

.neo-nav-item.active:hover {
  background: var(--color-primary-dark);
}

/* Danger Button (Logout) */
.neo-nav-item.danger:hover {
  background: var(--color-accent-pink);
  color: var(--color-black);
}

.main-content {
  flex: 1;
  background: var(--bg-surface-secondary); 
  position: relative;
  overflow: hidden;
  /* Retro Grid for empty states potentially handled in views */
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(-5px); }
  to { opacity: 1; transform: translateX(0); }
}
</style>
