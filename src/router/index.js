import { createRouter, createWebHashHistory } from 'vue-router'

// ── Lazy-loaded routes (Day 17: code splitting) ──
// Setiap view dibungkus dynamic import() sehingga Vite memisahkannya
// menjadi chunk terpisah, dimuat hanya saat route diakses.
const OverviewView  = () => import('@/views/OverviewView.vue')
const DevicesView   = () => import('@/views/DevicesView.vue')
const AnalyticsView = () => import('@/views/AnalyticsView.vue')
const AlertsView    = () => import('@/views/AlertsView.vue')
const TopologyView  = () => import('@/views/TopologyView.vue')
const SettingsView  = () => import('@/views/SettingsView.vue')

const routes = [
  {
    path: '/',
    redirect: '/overview'
  },
  {
    path: '/overview',
    name: 'Overview',
    component: OverviewView,
    meta: { title: 'Overview', icon: '⊞' }
  },
  {
    path: '/devices',
    name: 'Devices',
    component: DevicesView,
    meta: { title: 'Devices', icon: '◉' }
  },
  {
    path: '/topology',
    name: 'Topology',
    component: TopologyView,
    meta: { title: 'Fiber Topology', icon: '⬡' }
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: AnalyticsView,
    meta: { title: 'Analytics', icon: '⌇' }
  },
  {
    path: '/alerts',
    name: 'Alerts',
    component: AlertsView,
    meta: { title: 'Alarm Center', icon: '⚡' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsView,
    meta: { title: 'Settings', icon: '⚙' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/overview'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// Route guard — bisa dikembangkan untuk cek auth
router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || to.name} — FiberSight`
  next()
})

export default router
