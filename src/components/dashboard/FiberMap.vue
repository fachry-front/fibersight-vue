<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useDeviceStore } from '@/store/useDeviceStore.js'

const store = useDeviceStore()

// We use a canvas-based fallback map (Leaflet may need CSS in index.html)
// and also try to dynamically load vue-leaflet
const mapContainer = ref(null)
const mapReady     = ref(false)
const mapError     = ref(false)

let L     = null
let map   = null
let markers = {}

const STATUS_COLORS = {
  Normal:   '#7aad68',
  Warning:  '#c4a23e',
  Critical: '#e06464',
}

function makeIcon(status, L) {
  const color = STATUS_COLORS[status] || '#9a9688'
  const glow  = status === 'Critical' ? `box-shadow:0 0 10px ${color};animation:pulse 1.5s infinite;` : ''
  return L.divIcon({
    className: '',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};
                border:2px solid #131210;${glow}"></div>`
  })
}

async function initLeafletMap() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await nextTick()
    if (mapContainer.value && document.body.contains(mapContainer.value)) break
    await new Promise(resolve => setTimeout(resolve, 50))
  }

  if (!mapContainer.value || !document.body.contains(mapContainer.value)) {
    mapError.value = true
    return drawFallbackMap()
  }

  try {
    L = await import('leaflet')
    L = L.default || L

    // Dark tile: CartoDB Dark Matter
    map = L.map(mapContainer.value, {
      center: [-6.3, 106.85],
      zoom: 10,
      zoomControl: true,
      attributionControl: false,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© CartoDB',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map)

    // Plot all devices
    store.devices.filter(d => d.lat && d.lng).forEach(d => {
      const icon   = makeIcon(d.status, L)
      const marker = L.marker([d.lat, d.lng], { icon }).addTo(map)
      marker.bindPopup(`
        <div style="background:#1c1a16;border:1px solid rgba(160,158,140,0.2);padding:10px;border-radius:8px;font-family:Space Mono;font-size:11px;color:#e3e1dc;min-width:160px">
          <strong>${d.id}</strong><br>
          ${d.location}<br>
          Rx: ${d.rxPower} dBm<br>
          Status: <span style="color:${STATUS_COLORS[d.status]}">${d.status}</span>
        </div>
      `, { className: 'fiber-popup' })
      markers[d.id] = marker
    })

    mapReady.value = true
  } catch (err) {
    console.warn('Leaflet failed to load, using fallback canvas map', err)
    mapError.value = true
    drawFallbackMap()
  }
}

// Fallback canvas map for environments where Leaflet can't load tiles
function drawFallbackMap() {
  if (!mapContainer.value) return
  const canvas = document.createElement('canvas')
  canvas.style.width  = '100%'
  canvas.style.height = '100%'
  mapContainer.value.appendChild(canvas)

  function draw() {
    canvas.width  = mapContainer.value.offsetWidth  || 400
    canvas.height = mapContainer.value.offsetHeight || 200
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height

    ctx.fillStyle = '#0e0f0a'
    ctx.fillRect(0, 0, W, H)

    // Grid
    ctx.strokeStyle = 'rgba(160,158,140,0.06)'
    ctx.lineWidth = 1
    for (let i = 0; i < W; i += 40) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke() }
    for (let i = 0; i < H; i += 40) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(W, i); ctx.stroke() }

    // Project lat/lng to canvas
    const latMin = -6.7, latMax = -6.0, lngMin = 106.6, lngMax = 107.1
    function project(lat, lng) {
      const x = ((lng - lngMin) / (lngMax - lngMin)) * (W - 40) + 20
      const y = ((latMax - lat) / (latMax - latMin)) * (H - 40) + 20
      return [x, y]
    }

    // Area labels
    ctx.fillStyle = 'rgba(160,158,140,0.12)'
    ctx.font = '10px Space Mono'
    ctx.fillText('Tangerang', 30, 60)
    ctx.fillText('Jakarta', W/2 - 20, 50)
    ctx.fillText('Depok', W*0.4, H*0.6)
    ctx.fillText('Bogor', W*0.45, H*0.85)
    ctx.fillText('Bekasi', W*0.75, H*0.5)

    // Devices
    store.devices.filter(d => d.lat && d.lng).forEach(d => {
      const [x, y] = project(d.lat, d.lng)
      const color = STATUS_COLORS[d.status] || '#9a9688'
      if (d.status === 'Critical') {
        ctx.beginPath()
        ctx.arc(x, y, 10, 0, Math.PI * 2)
        ctx.fillStyle = `${color}22`
        ctx.fill()
      }
      ctx.beginPath()
      ctx.arc(x, y, 5, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
      ctx.strokeStyle = '#131210'
      ctx.lineWidth = 1.5
      ctx.stroke()

      ctx.fillStyle = '#9a9688'
      ctx.font = '8px Space Mono'
      ctx.textAlign = 'left'
      ctx.fillText(d.id, x + 7, y + 3)
    })
  }
  draw()
}

// FlyTo when selected device changes (PDR §4 — map FlyTo)
watch(() => store.selectedDeviceId, (id) => {
  if (!id || !map) return
  const dev = store.devices.find(d => d.id === id)
  if (!dev || !dev.lat || !dev.lng) return
  map.flyTo([dev.lat, dev.lng], 13, { duration: 1.2 })
  const marker = markers[id]
  if (marker) setTimeout(() => marker.openPopup(), 1300)
})

onMounted(async () => {
  await nextTick()
  initLeafletMap()
})
</script>

<template>
  <div class="card h-full flex flex-col">
    <div class="card-header">
      <div>
        <div class="card-title">Fiber Geographic Map</div>
        <div class="text-[10px] mt-0.5" style="color:#565248">
          Klik device di tabel → peta otomatis FlyTo
        </div>
      </div>
      <div class="flex items-center gap-2 text-[9px] font-mono" style="color:#565248">
        <span v-if="mapReady" class="text-ok">● Live</span>
        <span v-else-if="mapError" style="color:#565248">● Offline Map</span>
        <span v-else>Loading...</span>
      </div>
    </div>

    <div ref="mapContainer"
         class="flex-1 rounded-lg overflow-hidden"
         style="min-height:160px;background:#0e0f0a"></div>

    <!-- Legend -->
    <div class="flex gap-3 mt-2">
      <span class="text-[9px] font-mono" style="color:#565248">
        <span style="color:#7aad68">●</span> Normal
      </span>
      <span class="text-[9px] font-mono" style="color:#565248">
        <span style="color:#c4a23e">●</span> Warning
      </span>
      <span class="text-[9px] font-mono" style="color:#565248">
        <span style="color:#e06464">●</span> Critical (glowing)
      </span>
    </div>
  </div>
</template>

<style>
.fiber-popup .leaflet-popup-content-wrapper {
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
  box-shadow: none !important;
}
.fiber-popup .leaflet-popup-tip { display: none; }
</style>
