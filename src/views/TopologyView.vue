<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useDeviceStore, getBadgeClass } from '@/store/useDeviceStore.js'
import BaseBadge from '@/components/common/BaseBadge.vue'

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
  try {
    const visModule = await import('vis-network/standalone/esm/vis-network.min.js')
    const { Network, DataSet } = visModule

    const nodes = []
    const edges = []

    // OLT
    const olt = store.olts[0]
    if (olt) {
      nodes.push({
        id: olt.id, label: olt.id,
        color: { background: STATUS_COLOR.OLT.bg, border: STATUS_COLOR.OLT.border,
                 highlight: { background: '#242118', border: '#c4a23e' } },
        font:  { color: STATUS_COLOR.OLT.text, size: 12, face: 'Space Mono', bold: { color: STATUS_COLOR.OLT.text } },
        shape: 'box', margin: { top: 8, bottom: 8, left: 14, right: 14 },
        borderWidth: 2, shadow: { enabled: true, color: 'rgba(196,162,62,0.2)', size: 8 },
      })
    }

    // ODC
    const odcs = ['ODC-01', 'ODC-02']
    odcs.forEach(id => {
      nodes.push({
        id, label: id,
        color: { background: STATUS_COLOR.ODC.bg, border: STATUS_COLOR.ODC.border,
                 highlight: { background: '#1c1a10', border: 'rgba(160,158,140,0.4)' } },
        font:  { color: STATUS_COLOR.ODC.text, size: 10, face: 'Space Mono' },
        shape: 'box', margin: { top: 6, bottom: 6, left: 10, right: 10 },
        borderWidth: 1,
      })
      if (olt) {
        edges.push({
          from: olt.id, to: id,
          color: { color: 'rgba(160,158,140,0.2)', highlight: '#c4a23e' },
          width: 1.5, smooth: { type: 'cubicBezier', forceDirection: 'vertical', roundness: 0.4 }
        })
      }
    })

    // ODPs
    store.odps.forEach((d, i) => {
      const c = STATUS_COLOR[d.status] || STATUS_COLOR.Normal
      nodes.push({
        id: d.id,
        label: `${d.id}\n${d.rxPower} dBm`,
        title: `${d.id} — ${d.location}\nRx: ${d.rxPower} dBm\nStatus: ${d.status}`,
        color: {
          background: c.bg, border: c.border,
          highlight: { background: c.bg, border: c.text }
        },
        font:  { color: c.text, size: 9, face: 'Space Mono', multi: true },
        shape: 'box', margin: { top: 5, bottom: 5, left: 9, right: 9 },
        borderWidth: d.status === 'Critical' ? 2 : 1,
        shadow: d.status === 'Critical'
          ? { enabled: true, color: 'rgba(196,82,82,0.3)', size: 8 }
          : false,
      })
      const parentOdc = i < Math.ceil(store.odps.length / 2) ? 'ODC-01' : 'ODC-02'
      edges.push({
        from: parentOdc, to: d.id,
        color: {
          color: d.status === 'Critical' ? 'rgba(196,82,82,0.4)'
               : d.status === 'Warning'  ? 'rgba(196,162,62,0.3)'
               : 'rgba(160,158,140,0.15)',
          highlight: c.text
        },
        width: d.status === 'Critical' ? 1.5 : 1,
        smooth: { type: 'cubicBezier', forceDirection: 'vertical', roundness: 0.4 }
      })
    })

    if (network) { network.destroy(); network = null }

    network = new Network(
      container.value,
      { nodes: new DataSet(nodes), edges: new DataSet(edges) },
      {
        layout: {
          hierarchical: {
            enabled: true,
            direction: 'UD',
            sortMethod: 'directed',
            levelSeparation: 90,
            nodeSpacing: 110,
            treeSpacing: 200,
          }
        },
        physics: { enabled: false },
        interaction: {
          hover: true,
          tooltipDelay: 150,
          zoomView: true,
          dragView: true,
        },
        nodes: { borderWidthSelected: 2 },
        edges: {
          arrows: { to: { enabled: true, scaleFactor: 0.45 } },
        },
      }
    )

    network.on('click', params => {
      if (params.nodes.length > 0) store.selectDevice(params.nodes[0])
    })

  } catch (err) {
    console.warn('vis-network not available:', err)
  }
}

onMounted(() => buildNetwork())
onUnmounted(() => { if (network) { network.destroy(); network = null } })

watch(
  () => store.devices.map(d => d.status + d.rxPower).join('|'),
  () => buildNetwork(),
  { debounce: 600 }
)

function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="space-y-3">
    <div class="page-hdr">
      <div>
        <div class="page-title">Fiber Topology</div>
        <div class="page-subtitle">Visualisasi hierarki jaringan OLT → ODC → ODP</div>
      </div>
      <div class="flex items-center gap-3 text-[10px] font-mono" style="color:#565248">
        <span><span class="text-ok">●</span> Normal</span>
        <span><span class="text-warn">●</span> Warning</span>
        <span><span class="text-crit">●</span> Critical</span>
      </div>
    </div>

    <!-- vis-network canvas -->
    <div class="card" style="padding:0;overflow:hidden">
      <div class="px-4 pt-4 pb-2 flex items-center justify-between border-b"
           style="border-color:rgba(160,158,140,0.08)">
        <div>
          <div class="card-title">Network Topology — Live</div>
          <div class="text-[10px] mt-0.5" style="color:#565248">
            Drag untuk geser · Scroll untuk zoom · Klik node untuk detail
          </div>
        </div>
        <div class="flex items-center gap-2 text-[10px] font-mono" style="color:#565248">
          <span>{{ store.olts.length }} OLT</span>
          <span>·</span>
          <span>{{ store.odps.length }} ODP</span>
        </div>
      </div>
      <div ref="container"
           style="width:100%;height:420px;background:#0e0f0a"></div>
    </div>

    <!-- ODP Detail Table -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">ODP Status List</div>
        <span class="text-[10px] font-mono" style="color:#565248">
          {{ store.odps.length }} devices
        </span>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Device</th>
            <th>Location</th>
            <th>Rx Power (dBm)</th>
            <th>Tx Power</th>
            <th>ONUs</th>
            <th>Uptime</th>
            <th>Status</th>
            <th>Last Seen</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="d in store.odps" :key="d.id"
            class="cursor-pointer"
            :class="{ 'ring-1 ring-inset': store.selectedDeviceId === d.id }"
            style="--tw-ring-color:rgba(196,162,62,0.4)"
            @click="store.selectDevice(d.id)"
          >
            <td class="td-mono font-bold">{{ d.id }}</td>
            <td class="text-xs">{{ d.location }}</td>
            <td :class="d.rxPower <= -28 ? 'td-crit' : d.rxPower < -24 ? 'td-warn' : 'td-ok'">
              {{ d.rxPower }}
            </td>
            <td class="td-mono">{{ d.txPower }}</td>
            <td class="td-mono">{{ d.onu }}</td>
            <td class="td-mono" style="color:#565248">{{ d.uptime }}</td>
            <td><BaseBadge :status="d.status" /></td>
            <td class="td-mono" style="color:#565248">{{ fmtTime(d.lastSeen) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
