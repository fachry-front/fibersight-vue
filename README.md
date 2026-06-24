# FiberSight — Vue Edition

IoT Optical Network Monitoring Dashboard · **Vue 3 + Vite**

> Mini Project Perbandingan Framework — PKL PT. Solu IoT Engineering 2026

---

## Tech Stack

| Layer         | Library / Tool                        |
|---------------|---------------------------------------|
| Framework     | Vue 3 (Composition API + `<script setup>`) |
| Build Tool    | Vite 5                                |
| Routing       | Vue Router 4 (HashRouter + lazy load) |
| State         | Pinia 2                               |
| HTTP Client   | Axios 1.x + custom interceptors       |
| Charts        | ApexCharts + vue3-apexcharts          |
| Map           | Leaflet + @vue-leaflet/vue-leaflet    |
| Topology      | vis-network                           |
| Realtime      | Socket.IO client                      |
| Styling       | Tailwind CSS 3 + CSS Custom Properties|
| Testing       | Vitest + Vue Test Utils + MSW         |
| Fonts         | Plus Jakarta Sans · Space Mono        |

---

## Cara Menjalankan

### Prerequisites

- Node.js v18+
- npm v9+
- Backend (`fibersight-vue-backend`) berjalan di port 3000

### Development

```bash
npm install --legacy-peer-deps
npm run dev
```

Akses di: **http://localhost:5173**

### Production Build

```bash
npm run build
npm run preview   # → http://localhost:4173
```

---

## Environment Variables

Buat file `.env` di root folder frontend:

```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

File `.env.example` tersedia sebagai template.

---

## Menjalankan Tests

```bash
# Run sekali (untuk CI)
npm run test

# Watch mode (saat development)
npm run test:watch

# Dengan UI visual
npm run test:ui

# Dengan coverage report
npm run coverage
```

Test files ada di:
- `src/services/__tests__/deviceApi.test.js`
- `src/composables/__tests__/useFormValidation.test.js`
- `src/composables/__tests__/useTablePagination.test.js`
- `src/components/common/__tests__/BaseBadge.test.js`

---

## Struktur Project

```
src/
├── main.js
├── App.vue                        # Root component, layout shell, auto theme
│
├── assets/css/
│   └── tailwind.css               # Design tokens (CSS vars dark/light + komponen)
│
├── services/                      # Day 11: API service layer
│   ├── apiClient.js               # Axios instance + request/response interceptors
│   └── deviceApi.js               # Semua endpoint device & alarm + caching 5s
│
├── composables/                   # Reusable logic
│   ├── useApi.js                  # Generic loading/error/data wrapper
│   ├── useFormValidation.js       # Form validation: required, pattern, range, custom
│   └── useTablePagination.js      # Client-side sorting + pagination
│
├── store/                         # Day 12: Global state (Pinia)
│   ├── useDeviceStore.js          # Devices, histories, WebSocket, selected device
│   ├── useAlarmStore.js           # Alarms, acknowledge, unread count
│   └── useThemeStore.js           # Dark/light mode + auto-switch by time
│
├── router/
│   └── index.js                   # Routes (lazy-loaded, HashHistory)
│
├── components/
│   ├── common/
│   │   ├── BaseBadge.vue          # Status badge (Normal/Warning/Critical)
│   │   ├── BaseButton.vue
│   │   └── BaseCard.vue
│   ├── layout/
│   │   ├── Sidebar.vue            # Nav menu (accessible: <button> + aria)
│   │   ├── Header.vue             # Search, clock, theme toggle, alarm bell
│   │   └── SystemStatus.vue       # Status bar di bawah sidebar
│   └── dashboard/
│       ├── StatCards.vue          # 5 KPI cards
│       ├── PowerChart.vue         # Real-time Rx Power (ApexCharts area)
│       ├── AlarmCenter.vue        # Alarm feed mini
│       ├── InsightsRing.vue       # AI prediction ring + donut
│       ├── FiberMap.vue           # Leaflet map
│       ├── TopologyTree.vue       # vis-network topology
│       └── DeviceTable.vue        # Sortable + paginated table (Day 15)
│
├── views/
│   ├── OverviewView.vue           # Dashboard utama
│   ├── DevicesView.vue            # Manajemen device + form Add (Day 13)
│   ├── AlertsView.vue             # Alarm management + acknowledge
│   ├── AnalyticsView.vue          # Charts analitik
│   ├── TopologyView.vue           # Full-page topology
│   └── SettingsView.vue           # Konfigurasi + System Info
│
└── test/
    ├── setup.js                   # MSW server setup untuk semua test
    └── mocks/
        ├── handlers.js            # HTTP mock handlers (MSW)
        └── server.js              # MSW node server instance
```

---

## Fitur

| Fitur | Keterangan |
|---|---|
| Dark/Light otomatis | 17:00–05:00 dark, 05:01–16:59 light. Refresh-free via `setInterval`. |
| Real-time telemetry | Socket.IO WebSocket dari backend, update chart & tabel langsung |
| REST API + Axios | Service layer terpisah, interceptors, caching 5 detik |
| Form validation | Regex (Device ID), range check (Rx Power, suhu), custom validator |
| Table sort + pagination | Klik header kolom untuk sort, pagination 8 baris per halaman |
| Alarm management | Acknowledge per alarm atau sekaligus |
| Fiber Map | Leaflet + CartoDB Dark, FlyTo saat device diklik |
| Topology tree | vis-network OLT → ODC → ODP, color-coded by status |
| AI Prediction Ring | Identifikasi device Rx Power terburuk sebagai risk indicator |
| Loading screen | Animasi branding PT. Solu sebelum app load |

---

## Perbandingan Framework

Proyek ini adalah satu dari tiga versi yang identik untuk membandingkan performa:

| Aspek | Vue 3 | React 18 | Angular 17 |
|---|---|---|---|
| State | Pinia | Context + useReducer | NgRx / Signals |
| Reactivity | `ref` / `reactive` | `useState` | RxJS / Signals |
| Template | SFC `.vue` | JSX | HTML template |
| Two-way bind | `v-model` | `value + onChange` | `[(ngModel)]` |
| Lifecycle | `onMounted` | `useEffect` | `ngOnInit` |

---

## Scripts Tersedia

```bash
npm run dev          # Dev server (http://localhost:5173)
npm run build        # Production build ke /dist
npm run preview      # Preview production build
npm run test         # Run semua test (sekali)
npm run test:watch   # Test watch mode
npm run test:ui      # Test dengan UI visual
npm run coverage     # Coverage report
```

---

*FiberSight Vue · PKL 2026 · PT. Solu IoT Engineering*
