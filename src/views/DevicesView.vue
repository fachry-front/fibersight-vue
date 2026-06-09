<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useDeviceStore, getStatus, getBadgeClass, getRxClass } from '@/store/useDeviceStore.js'
import BaseCard   from '@/components/common/BaseCard.vue'
import BaseBadge  from '@/components/common/BaseBadge.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const store       = useDeviceStore()
const filterStatus = ref('All')
const searchQ      = ref('')
const showModal    = ref(false)
const toast        = ref('')
const toastVis     = ref(false)
let toastTimer

const form = ref({
  id: '', type: 'ODP', location: '', area: 'Jakarta',
  rxPower: -18.5, txPower: 2.2, temperature: 42
})

const filtered = computed(() => {
  return store.devices.filter(d => {
    if (filterStatus.value !== 'All' && d.status !== filterStatus.value) return false
    if (searchQ.value && !d.id.toLowerCase().includes(searchQ.value.toLowerCase())
                      && !d.location.toLowerCase().includes(searchQ.value.toLowerCase())) return false
    return true
  })
})

function addDevice() {
  if (!form.value.id || !form.value.location) {
    showToast('Isi semua field yang diperlukan!'); return
  }
  const ok = store.addDevice({ ...form.value })
  if (!ok) { showToast(`Device ${form.value.id} sudah ada!`); return }
  showModal.value = false
  showToast(`✓ Device ${form.value.id} berhasil ditambahkan`)
  form.value = { id: '', type: 'ODP', location: '', area: 'Jakarta', rxPower: -18.5, txPower: 2.2, temperature: 42 }
}

function deleteDevice(id) {
  store.deleteDevice(id)
  showToast(`Device ${id} dihapus`)
}

function showToast(msg) {
  clearTimeout(toastTimer)
  toast.value = msg; toastVis.value = true
  toastTimer = setTimeout(() => toastVis.value = false, 2500)
}

function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

onMounted(() => store.startLiveSimulation())
onUnmounted(() => store.stopLiveSimulation())
</script>

<template>
  <div class="space-y-3">

    <!-- Header -->
    <div class="page-hdr">
      <div>
        <div class="page-title">Devices</div>
        <div class="page-subtitle">OLT & ODP Device Management</div>
      </div>
      <div class="flex items-center gap-2">
        <div class="flex gap-1">
          <button v-for="s in ['All','Normal','Warning','Critical']" :key="s"
                  class="filter-tab" :class="{ active: filterStatus === s }"
                  @click="filterStatus = s">{{ s }}</button>
        </div>
        <input v-model="searchQ" type="text" placeholder="Search..."
               class="form-input py-1 text-[10px]" style="width:140px"/>
        <button class="btn btn-primary btn-xs" @click="showModal = true">+ Add Device</button>
      </div>
    </div>

    <!-- Summary -->
    <div class="grid grid-cols-4 gap-3">
      <div class="card stat-card" style="--accent:#7aad68">
        <div class="stat-lbl">Normal</div>
        <div class="stat-val text-ok">{{ store.analytics.normal }}</div>
      </div>
      <div class="card stat-card" style="--accent:#c4a23e">
        <div class="stat-lbl">Warning</div>
        <div class="stat-val text-warn">{{ store.analytics.warning }}</div>
      </div>
      <div class="card stat-card" style="--accent:#c45252">
        <div class="stat-lbl">Critical</div>
        <div class="stat-val text-crit">{{ store.analytics.critical }}</div>
      </div>
      <div class="card stat-card" style="--accent:#4a9080">
        <div class="stat-lbl">Total Devices</div>
        <div class="stat-val">{{ store.analytics.total }}</div>
      </div>
    </div>

    <!-- Device Grid -->
    <div class="grid gap-3" style="grid-template-columns:repeat(auto-fill,minmax(200px,1fr))">
      <div v-for="d in filtered" :key="d.id"
           class="device-card"
           :class="{ 'selected': store.selectedDeviceId === d.id }"
           @click="store.selectDevice(d.id)"
           v-motion
           :initial="{ opacity: 0, y: 8 }"
           :enter="{ opacity: 1, y: 0, transition: { duration: 300 } }">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold font-mono">{{ d.id }}</span>
          <BaseBadge :status="d.status" />
        </div>
        <div class="text-xs mb-2" style="color:#9a9688">{{ d.location }}</div>
        <div class="mb-2">
          <span class="text-xl font-display font-bold"
                :class="getRxClass(d.rxPower) === 'td-crit' ? 'text-crit' : getRxClass(d.rxPower) === 'td-warn' ? 'text-warn' : 'text-ok'">
            {{ d.rxPower }}
          </span>
          <span class="text-xs ml-1" style="color:#565248">dBm Rx</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-[10px] font-mono" style="color:#565248">{{ d.type }}</span>
          <div class="flex gap-1">
            <button class="btn btn-xs" @click.stop>👁</button>
            <button class="btn btn-xs btn-danger" @click.stop="deleteDevice(d.id)">✕</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Selected Device Detail -->
    <Transition name="slide-up">
      <div v-if="store.selectedDevice" class="card">
        <div class="card-header">
          <div>
            <div class="card-title">{{ store.selectedDevice.id }} — Detail</div>
            <div class="text-[10px] mt-0.5" style="color:#565248">{{ store.selectedDevice.location }}</div>
          </div>
          <div class="flex gap-2">
            <button class="btn btn-xs btn-danger" @click="deleteDevice(store.selectedDevice.id)">Delete</button>
            <button class="btn btn-xs" @click="store.selectDevice(null)">✕ Close</button>
          </div>
        </div>
        <div class="grid grid-cols-5 gap-3">
          <div class="card stat-card" style="--accent:#4a9080">
            <div class="stat-lbl">Rx Power</div>
            <div class="stat-val text-sm"
                 :class="getRxClass(store.selectedDevice.rxPower) === 'td-crit' ? 'text-crit' : getRxClass(store.selectedDevice.rxPower) === 'td-warn' ? 'text-warn' : 'text-ok'">
              {{ store.selectedDevice.rxPower }} dBm
            </div>
          </div>
          <div class="card stat-card" style="--accent:#7aad68">
            <div class="stat-lbl">Tx Power</div>
            <div class="stat-val text-sm">{{ store.selectedDevice.txPower }} dBm</div>
          </div>
          <div class="card stat-card" style="--accent:#c4a23e">
            <div class="stat-lbl">Temperature</div>
            <div class="stat-val text-sm"
                 :class="store.selectedDevice.temperature >= 65 ? 'text-crit' : store.selectedDevice.temperature >= 55 ? 'text-warn' : ''">
              {{ store.selectedDevice.temperature }}°C
            </div>
          </div>
          <div class="card stat-card" style="--accent:#4a9080">
            <div class="stat-lbl">ONUs</div>
            <div class="stat-val text-sm">{{ store.selectedDevice.onu }}</div>
          </div>
          <div class="card stat-card" style="--accent:#7aad68">
            <div class="stat-lbl">Uptime</div>
            <div class="stat-val text-sm" style="font-size:14px;padding-top:2px">{{ store.selectedDevice.uptime }}</div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Add Device Modal -->
    <Transition name="fade">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal-box">
          <div class="modal-title">Add New Device</div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="form-label">Device ID</label>
              <input v-model="form.id" class="form-input" placeholder="ODP-99"/>
            </div>
            <div>
              <label class="form-label">Location</label>
              <input v-model="form.location" class="form-input" placeholder="Jakarta Selatan"/>
            </div>
            <div>
              <label class="form-label">Type</label>
              <select v-model="form.type" class="form-input">
                <option>OLT</option><option>ODP</option>
              </select>
            </div>
            <div>
              <label class="form-label">Area</label>
              <select v-model="form.area" class="form-input">
                <option>Jakarta</option><option>Bogor</option><option>Depok</option>
                <option>Tangerang</option><option>Bekasi</option>
              </select>
            </div>
            <div>
              <label class="form-label">Rx Power (dBm)</label>
              <input v-model.number="form.rxPower" type="number" step="0.1" class="form-input"/>
            </div>
            <div>
              <label class="form-label">Tx Power (dBm)</label>
              <input v-model.number="form.txPower" type="number" step="0.1" class="form-input"/>
            </div>
            <div>
              <label class="form-label">Temperature (°C)</label>
              <input v-model.number="form.temperature" type="number" class="form-input"/>
            </div>
          </div>
          <div class="flex justify-end gap-2 mt-4">
            <button class="btn" @click="showModal = false">Cancel</button>
            <button class="btn btn-primary" @click="addDevice">Add Device</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Toast -->
    <Transition name="fade">
      <div v-if="toastVis" class="toast">{{ toast }}</div>
    </Transition>
  </div>
</template>
