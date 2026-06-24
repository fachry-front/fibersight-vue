import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueApexCharts from 'vue3-apexcharts'
import { MotionPlugin } from '@vueuse/motion'

import App    from './App.vue'
import router from './router/index.js'

import './assets/css/tailwind.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueApexCharts)   // auto-registers <apexchart> component globally
app.use(MotionPlugin)

app.mount('#app')
