# FiberSight — IoT Fiber Optic Monitoring Dashboard

> Real-Time Optical Network Monitoring System untuk NOC Engineer  
> Dibangun dengan Vue 3 + Vite + Tailwind CSS + Pinia + ApexCharts + vis-network + Leaflet

---

## 📋 Tech Stack

| Komponen        | Teknologi              |
|-----------------|------------------------|
| Core Framework  | Vue.js 3 `<script setup>` |
| Build Tool      | Vite                   |
| Styling         | Tailwind CSS v3        |
| State Management| Pinia                  |
| Charts          | ApexCharts + vue3-apexcharts |
| Topology Engine | vis-network v9         |
| Maps            | Vue Leaflet (OpenStreetMap) |
| Animation       | @vueuse/motion         |
| Typography      | Plus Jakarta Sans      |

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Run development server
```bash
npm run dev
```

Buka browser di `http://localhost:5173`

### 3. Build untuk production
```bash
npm run build
npm run preview
```

---

## 📁 Struktur Direktori

```
src/
├── assets/
│   ├── css/
│   │   └── tailwind.css          # Entry point Tailwind + CSS variables
│   └── images/
│       └── logo-fibersight.png
│
├── components/
│   ├── common/
│   │   ├── BaseCard.vue          # Glassmorphism card container
│   │   ├── BaseBadge.vue         # Status badge (Normal/Warning/Critical)
│   │   └── BaseButton.vue        # Button dengan tactile feedback
│   │
│   ├── layout/
│   │   ├── Sidebar.vue           # Navigasi kiri + alarm badge
│   │   ├── Header.vue            # Top bar: search, alarm bell, profile
│   │   └── SystemStatus.vue      # Breathing dot indicator
│   │
│   └── dashboard/
│       ├── StatCards.vue         # 5 metrik macro (OLT, ODP, Alarm, Rx Power)
│       ├── PowerChart.vue        # ApexCharts area chart Rx Power live
│       ├── TopologyTree.vue      # vis-network OLT→ODC→ODP tree
│       ├── AlarmCenter.vue       # List alarm real-time
│       ├── InsightsRing.vue      # AI risk ring + power distribution donut
│       ├── FiberMap.vue          # Leaflet peta geografis + FlyTo
│       └── DeviceTable.vue       # Tabel device dengan cross-widget sync
│
├── views/
│   ├── OverviewView.vue          # Halaman utama dashboard grid
│   ├── DevicesView.vue           # Manajemen device (tambah/hapus)
│   ├── TopologyView.vue          # Full topology + ODP table
│   ├── AnalyticsView.vue         # Trend multi-device + temperature bar
│   ├── AlertsView.vue            # Alarm center + acknowledge
│   └── SettingsView.vue          # Threshold, MQTT, notifikasi, profile
│
├── router/
│   └── index.js                  # Vue Router + route guard
│
├── store/
│   ├── useDeviceStore.js         # Pinia: telemetri OLT/ODP + FIFO history
│   └── useAlarmStore.js          # Pinia: antrian alarm real-time
│
├── App.vue                       # Root layout + loading screen
└── main.js                       # Entry point
```

---

## 🔥 Fitur Utama

### Real-time Monitoring
- Simulasi live data IoT setiap **4 detik** (FIFO buffer max 30 titik)
- Rx Power threshold: Normal ≥-24 dBm · Warning -24~-27 dBm · Critical ≤-28 dBm
- Temperature threshold: Warning ≥55°C · Critical ≥65°C

### Cross-Widget Synchronization (PDR §4)
Klik baris di `DeviceTable` → otomatis:
- `FiberMap.vue` **FlyTo** koordinat ODP tersebut
- `PowerChart.vue` update grafik riwayat device tersebut

### Halaman Lengkap
| Route | Halaman |
|-------|---------|
| `/overview` | Dashboard utama |
| `/devices` | Grid device + add/delete |
| `/topology` | vis-network tree |
| `/analytics` | Trend + temperature bar |
| `/alerts` | Alarm center + acknowledge |
| `/settings` | Config threshold, MQTT, notifikasi |

### Animasi UX (PDR §5)
- **Staggered entrance**: StatCards muncul berurutan (v-motion)
- **Breathing dot**: SystemStatus pulse lambat
- **Tactile hover**: card naik 1px on hover
- **FlyTo map**: peta geser smooth saat device dipilih
- **Glow pulse**: alarm bell merah saat ada critical alarm

---

## ⚙️ Konfigurasi Threshold

Edit di `src/store/useDeviceStore.js`:

```js
export const THRESHOLD = {
  NORMAL_MIN:   -24,   // >= -24 dBm  → Normal
  WARNING_MIN:  -27,   // -24 ~ -27   → Warning
  CRITICAL_MAX: -28,   // <= -28 dBm  → Critical
  TEMP_WARN:     55,
  TEMP_CRIT:     65,
  HISTORY_LIMIT: 30    // FIFO buffer
}
```

---

## 🗺️ Peta (Leaflet)

Menggunakan **CartoDB Dark Matter** tiles secara default.  
Jika tiles gagal load (offline), fallback ke canvas map built-in.

---

## 📦 Build Output

```bash
npm run build
# Output: dist/
```

Deploy ke Nginx / Apache / Vercel / Netlify — tinggal serve folder `dist/`.

---

> © 2026 FiberSight v1.0.0 — Fachry Ahmad  
> Tahun Akademik 2025/2026
