import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Generator',
    component: () => import('@/views/GeneratorView.vue')
  },
  {
    path: '/library',
    name: 'Library',
    component: () => import('@/views/LibraryView.vue')
  },
  {
    path: '/export',
    name: 'Export',
    component: () => import('@/views/ExportView.vue')
  }
]

const router = createRouter({
  history: createWebHistory('/FBR2728/'),
  routes
})

export default router


