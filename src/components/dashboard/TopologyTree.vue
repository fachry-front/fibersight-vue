<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useDeviceStore } from '@/store/useDeviceStore.js'

const store     = useDeviceStore()
const container = ref(null)
let network     = null

const STATUS_COLOR = {
  Normal:   { bg: '#1c2418', border: 'rgba(122,173,104,0.5)',  text: '#7aad68' },
  Warning:  { bg: '#22200e', border: 'rgba(196,162,62,0.5)',   text: '#c4a23e' },
  Critical: { bg: '#211010', border: 'rgba(196,82,82,0.65)',   text: '#e06464' },
  OLT:      { bg: '#1d1a10', border: 'rgba(196,162,62,0.6)',   text: '#c4a23e' },
  ODC:      { bg: '#161512', border: 'rgba(160,158,140,0.25)', text: '#9a9688' },
}

async function buildNetwork() {
  if (!container.value) return
  const { Network, DataSet } = await import('vis-network/standalone/esm/vis-network.min.js')

  const nodes = []
  const edges = []

  // OLT root
  const olt = store.olts[0]
  if (olt) {
    nodes.push({
      id: olt.id, label: olt.id,
      color: { background: STATUS_COLOR.OLT.bg, border: STATUS_COLOR.OLT.border, highlight: { background: '#242118', border: '#c4a23e' } },
      font:  { color: STATUS_COLOR.OLT.text, size: 11, face: 'Space Mono', bold: { color: STATUS_COLOR.OLT.text } },
      shape: 'box', margin: { top: 6, bottom: 6, left: 10, right: 10 },
      borderWidth: 1.5, shadow: false,
    })
  }

  // ODC nodes
  const odcs = [{ id: 'ODC-01' }, { id: 'ODC-02' }]
  odcs.forEach(odc => {
    nodes.push({
      id: odc.id, label: odc.id,
      color: { background: STATUS_COLOR.ODC.bg, border: STATUS_COLOR.ODC.border },
      font:  { color: STATUS_COLOR.ODC.text, size: 10, face: 'Space Mono' },
      shape: 'box', margin: { top: 5, bottom: 5, left: 8, right: 8 },
      borderWidth: 1,
    })
    if (olt) edges.push({ from: olt.id, to: odc.id, color: { color: 'rgba(160,158,140,0.18)', highlight: '#c4a23e' }, width: 1, smooth: { type: 'cubicBezier' } })
  })

  // ODP nodes (split between ODC-01 and ODC-02)
  store.odps.forEach((d, i) => {
    const c = STATUS_COLOR[d.status] || STATUS_COLOR.Normal
    nodes.push({
      id: d.id,
      label: `${d.id}\n${d.rxPower} dBm`,
      color: {
        background: c.bg,
        border: c.border,
        highlight: { background: c.bg, border: c.text }
      },
      font:  { color: c.text, size: 9, face: 'Space Mono', multi: true },
      shape: 'box', margin: { top: 5, bottom: 5, left: 8, right: 8 },
      borderWidth: d.status === 'Critical' ? 2 : 1,
    })
    const parentOdc = i < Math.ceil(store.odps.length / 2) ? 'ODC-01' : 'ODC-02'
    edges.push({
      from: parentOdc, to: d.id,
      color: {
        color: d.status === 'Critical' ? 'rgba(196,82,82,0.35)'
             : d.status === 'Warning'  ? 'rgba(196,162,62,0.3)'
             : 'rgba(160,158,140,0.14)',
        highlight: c.text
      },
      width: 1, smooth: { type: 'cubicBezier' }
    })
  })

  if (network) network.destroy()
  network = new Network(
    container.value,
    { nodes: new DataSet(nodes), edges: new DataSet(edges) },
    {
      layout: { hierarchical: { direction: 'UD', sortMethod: 'directed', levelSeparation: 80, nodeSpacing: 100 } },
      physics: { enabled: false },
      interaction: { hover: true, tooltipDelay: 200 },
      nodes: { borderWidthSelected: 2 },
      edges: { arrows: { to: { enabled: true, scaleFactor: 0.5 } }, smooth: { type: 'cubicBezier' } },
    }
  )

  // Click → select device in store
  network.on('click', params => {
    if (params.nodes.length > 0) {
      store.selectDevice(params.nodes[0])
    }
  })
}

onMounted(() => { buildNetwork() })
onUnmounted(() => { if (network) { network.destroy(); network = null } })

// Rebuild when device data changes
watch(() => store.devices.map(d => d.status + d.rxPower).join(), () => { buildNetwork() })
</script>

<template>
  <div class="card h-full flex flex-col">
    <div class="card-header">
      <div>
        <div class="card-title">Fiber Topology</div>
        <div class="text-[10px] mt-0.5" style="color:#565248">OLT → ODC → ODP live tree</div>
      </div>
      <div class="flex items-center gap-3 text-[9px] font-mono" style="color:#565248">
        <span><span style="color:#7aad68">●</span> Normal</span>
        <span><span style="color:#c4a23e">●</span> Warning</span>
        <span><span style="color:#e06464">●</span> Critical</span>
      </div>
    </div>
    <div ref="container" class="flex-1 rounded-lg overflow-hidden" style="min-height:200px;background:#131210"></div>
  </div>
</template>
