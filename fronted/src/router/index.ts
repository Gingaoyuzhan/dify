import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/workflow'
    },
    {
      path: '/workflow',
      component: () => import('../views/WorkflowView.vue'),
      meta: { layout: 'MainLayout' }
    },
    {
      path: '/knowledge',
      component: () => import('../views/KnowledgeView.vue'),
      meta: { layout: 'MainLayout' }
    },
    {
      path: '/agent',
      component: () => import('../views/AgentView.vue'),
      meta: { layout: 'MainLayout' }
    }
  ]
})

export default router
