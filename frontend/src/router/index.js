import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'

const routes = [
    { path: '/',         name: 'dashboard', component: DashboardView },
    { path: '/nodes',    name: 'nodes',     component: () => import('@/views/NodesView.vue') },
    { path: '/history',  name: 'history',   component: () => import('@/views/HistoryView.vue') },
    { path: '/alerts',   name: 'alerts',    component: () => import('@/views/AlertsView.vue') },
    { path: '/map',      name: 'map',       component: () => import('@/views/MapView.vue') },
    { path: '/settings', name: 'settings',  component: () => import('@/views/SettingsView.vue') },
    { path: '/docs',     name: 'docs',      component: () => import('@/views/DocsView.vue') },
]

export default createRouter({
    history: createWebHistory(),
    routes,
})