import { createRouter, createWebHashHistory } from 'vue-router'

import OverviewView  from '@/views/OverviewView.vue'
import DevicesView   from '@/views/DevicesView.vue'
import AnalyticsView from '@/views/AnalyticsView.vue'
import AlertsView    from '@/views/AlertsView.vue'
import TopologyView  from '@/views/TopologyView.vue'
import SettingsView  from '@/views/SettingsView.vue'

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
