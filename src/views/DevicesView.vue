<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useDeviceStore, getStatus, getRxClass } from '@/store/useDeviceStore.js'
import { useFormValidation, rules, PATTERNS } from '@/composables/useFormValidation.js'
import { useSearchStore } from '@/store/useSearchStore.js'
import BaseBadge from '@/components/common/BaseBadge.vue'

const store       = useDeviceStore()
const searchSt    = useSearchStore()
const route       = useRoute()
const filterStatus = ref('All')
const showModal    = ref(false)
const submitting   = ref(false)
const toast        = ref(''); const toastVis = ref(false); let toastTimer

// Fix 6: Search dari header langsung dipakai di sini
// Juga baca dari route query (?q=...) kalau masuk dari header
const searchQ = computed({
  get: () => searchSt.query || (route.query.q ?? ''),
  set: (v) => searchSt.setQuery(v),
})

const form = ref({ id:'', type:'ODP', location:'', area:'Jakarta', rxPower:-18.5, txPower:2.2, temperature:42 })

// ── Validation schema (Day 13) ──
const { errors, validate, validateField, resetErrors } = useFormValidation(form, {
  id: [
    rules.required('Device ID wajib diisi'),
    rules.pattern(PATTERNS.DEVICE_ID, 'Format harus XXX-00 (contoh: ODP-12, OLT-01)'),
  ],
  location: [
    rules.required('Lokasi wajib diisi'),
    rules.custom(v => v.trim().length >= 3, 'Lokasi minimal 3 karakter'),
  ],
  rxPower: [
    rules.required('Rx Power wajib diisi'),
    rules.range(-40, -5, 'Rx Power harus antara -40 dan -5 dBm'),
  ],
  txPower: [
    rules.required('Tx Power wajib diisi'),
    rules.range(-10, 10, 'Tx Power harus antara -10 dan 10 dBm'),
  ],
  temperature: [
    rules.required('Temperature wajib diisi'),
    rules.range(0, 100, 'Temperature harus antara 0 dan 100°C'),
  ],
})

const filtered = computed(() =>
  store.devices.filter(d => {
    if (filterStatus.value !== 'All' && d.status !== filterStatus.value) return false
    if (searchQ.value) {
      const q = searchQ.value.toLowerCase()
      return d.id.toLowerCase().includes(q) || d.location.toLowerCase().includes(q)
    }
    return true
  })
)

async function addDevice() {
  if (!validate()) {
    showToast('⚠ Periksa kembali isian form')
    return
  }

  submitting.value = true
  try {
    const ok = await store.addDevice({ ...form.value })
    if (!ok) {
      showToast(`✗ ${form.value.id} sudah ada!`)
      return
    }
    showModal.value = false
    showToast(`✓ ${form.value.id} ditambahkan`)
    form.value = { id:'', type:'ODP', location:'', area:'Jakarta', rxPower:-18.5, txPower:2.2, temperature:42 }
    resetErrors()
  } catch (err) {
    showToast(`✗ Gagal menambah device: ${err.message}`)
  } finally {
    submitting.value = false
  }
}

function closeModal() {
  showModal.value = false
  resetErrors()
}

async function deleteDevice(id) {
  await store.deleteDevice(id)
  showToast(`${id} dihapus`)
}

function showToast(msg) {
  clearTimeout(toastTimer); toast.value = msg; toastVis.value = true
  toastTimer = setTimeout(() => toastVis.value = false, 2500)
}

function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' })
}

onMounted(() => store.startLiveSimulation())
onUnmounted(() => store.stopLiveSimulation())
</script>

<template>
  <div class="space-y-4">
    <div class="page-hdr">
      <div>
        <div class="page-title">Devices</div>
        <div class="page-subtitle">OLT & ODP Device Management</div>
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <div class="flex gap-1 flex-wrap">
          <button v-for="s in ['All','Normal','Warning','Critical']" :key="s"
                  class="filter-tab" :class="{active: filterStatus===s}"
                  @click="filterStatus=s">{{ s }}</button>
        </div>
        <div class="relative">
          <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none"
               style="color:var(--text-muted)" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input v-model="searchQ" type="text" placeholder="Search..." aria-label="Search devices by ID or location"
                 class="form-input pl-8 py-1.5 text-[11px]" style="width:150px"/>
        </div>
        <button class="btn btn-primary btn-xs" @click="showModal=true">+ Add Device</button>
      </div>
    </div>

    <!-- Summary stats -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="stat-card" style="--accent:var(--normal-text)">
        <div class="stat-lbl">Normal</div>
        <div class="stat-val" style="color:var(--normal-text)">{{ store.analytics.normal }}</div>
      </div>
      <div class="stat-card" style="--accent:var(--warning-text)">
        <div class="stat-lbl">Warning</div>
        <div class="stat-val" style="color:var(--warning-text)">{{ store.analytics.warning }}</div>
      </div>
      <div class="stat-card" style="--accent:var(--critical-text)">
        <div class="stat-lbl">Critical</div>
        <div class="stat-val" style="color:var(--critical-text)">{{ store.analytics.critical }}</div>
      </div>
      <div class="stat-card" style="--accent:var(--accent-teal)">
        <div class="stat-lbl">Total Devices</div>
        <div class="stat-val" style="color:var(--accent-teal)">{{ store.analytics.total }}</div>
      </div>
    </div>

    <!-- Device grid -->
    <div class="grid gap-3"
         style="grid-template-columns:repeat(auto-fill,minmax(185px,1fr))">
      <div v-for="d in filtered" :key="d.id"
           class="device-card" :class="{selected: store.selectedDeviceId===d.id}"
           @click="store.selectDevice(d.id)"
           v-motion :initial="{opacity:0,y:8}" :enter="{opacity:1,y:0,transition:{duration:300}}">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold font-mono" style="color:var(--text-primary)">{{ d.id }}</span>
          <BaseBadge :status="d.status"/>
        </div>
        <div class="text-xs mb-2" style="color:var(--text-secondary)">{{ d.location }}</div>
        <div class="mb-2">
          <span class="text-xl font-bold font-display"
                :class="getRxClass(d.rxPower)"
                :style="{color: d.rxPower<=-28?'var(--critical-text)':d.rxPower<-24?'var(--warning-text)':'var(--normal-text)'}">
            {{ d.rxPower }}
          </span>
          <span class="text-xs ml-1" style="color:var(--text-muted)">dBm</span>
        </div>
        <div class="flex items-center justify-between mt-2">
          <span class="text-[10px] font-mono" style="color:var(--text-muted)">{{ d.type }}</span>
          <div class="flex gap-1">
            <button class="btn btn-xs" aria-label="View device details" @click.stop="store.selectDevice(d.id)">👁</button>
            <button class="btn btn-xs btn-danger" aria-label="Delete device" @click.stop="deleteDevice(d.id)">✕</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Selected detail -->
    <Transition name="slide-up">
      <div v-if="store.selectedDevice" class="card">
        <div class="card-header">
          <div>
            <div class="card-title">{{ store.selectedDevice.id }} — Detail</div>
            <div class="text-[10px] mt-0.5" style="color:var(--text-muted)">
              {{ store.selectedDevice.location }}
            </div>
          </div>
          <div class="flex gap-2">
            <button class="btn btn-xs btn-danger" @click="deleteDevice(store.selectedDevice.id)">Delete</button>
            <button class="btn btn-xs" @click="store.selectDevice(null)">✕ Close</button>
          </div>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div class="stat-card" style="--accent:var(--accent-teal)">
            <div class="stat-lbl">Rx Power</div>
            <div class="stat-val text-base"
                 :style="{color: store.selectedDevice.rxPower<=-28?'var(--critical-text)':store.selectedDevice.rxPower<-24?'var(--warning-text)':'var(--normal-text)'}">
              {{ store.selectedDevice.rxPower }} dBm
            </div>
          </div>
          <div class="stat-card" style="--accent:var(--normal-text)">
            <div class="stat-lbl">Tx Power</div>
            <div class="stat-val text-base">{{ store.selectedDevice.txPower }} dBm</div>
          </div>
          <div class="stat-card" style="--accent:var(--accent-gold)">
            <div class="stat-lbl">Temperature</div>
            <div class="stat-val text-base"
                 :style="{color:store.selectedDevice.temperature>=65?'var(--critical-text)':store.selectedDevice.temperature>=55?'var(--warning-text)':'var(--text-primary)'}">
              {{ store.selectedDevice.temperature }}°C
            </div>
          </div>
          <div class="stat-card" style="--accent:var(--accent-teal)">
            <div class="stat-lbl">ONUs</div>
            <div class="stat-val text-base" style="color:var(--accent-teal)">
              {{ store.selectedDevice.onu }}
            </div>
          </div>
          <div class="stat-card" style="--accent:var(--normal-text)">
            <div class="stat-lbl">Uptime</div>
            <div class="stat-val text-sm" style="font-size:14px;padding-top:3px">
              {{ store.selectedDevice.uptime }}
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Modal -->
    <Transition name="fade">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-box">
          <div class="modal-title">Add New Device</div>
          <div class="grid grid-cols-2 gap-3">
            <div class="col-span-2 sm:col-span-1">
              <label class="form-label" for="device-id">Device ID</label>
              <input id="device-id" v-model="form.id" class="form-input"
                     :class="{ 'border-red-500': errors.id }"
                     placeholder="ODP-99" @blur="validateField('id')"/>
              <p v-if="errors.id" class="text-[10px] mt-1 text-crit">{{ errors.id }}</p>
            </div>
            <div class="col-span-2 sm:col-span-1">
              <label class="form-label" for="device-location">Location</label>
              <input id="device-location" v-model="form.location" class="form-input"
                     :class="{ 'border-red-500': errors.location }"
                     placeholder="Jakarta Selatan" @blur="validateField('location')"/>
              <p v-if="errors.location" class="text-[10px] mt-1 text-crit">{{ errors.location }}</p>
            </div>
            <div>
              <label class="form-label" for="device-type">Type</label>
              <select id="device-type" v-model="form.type" class="form-input">
                <option>OLT</option><option>ODP</option>
              </select>
            </div>
            <div>
              <label class="form-label" for="device-area">Area</label>
              <select id="device-area" v-model="form.area" class="form-input">
                <option>Jakarta</option><option>Bogor</option>
                <option>Depok</option><option>Tangerang</option><option>Bekasi</option>
              </select>
            </div>
            <div>
              <label class="form-label" for="device-rx">Rx Power (dBm)</label>
              <input id="device-rx" v-model.number="form.rxPower" type="number" step="0.1" class="form-input"
                     :class="{ 'border-red-500': errors.rxPower }"
                     @blur="validateField('rxPower')"/>
              <p v-if="errors.rxPower" class="text-[10px] mt-1 text-crit">{{ errors.rxPower }}</p>
            </div>
            <div>
              <label class="form-label" for="device-tx">Tx Power (dBm)</label>
              <input id="device-tx" v-model.number="form.txPower" type="number" step="0.1" class="form-input"
                     :class="{ 'border-red-500': errors.txPower }"
                     @blur="validateField('txPower')"/>
              <p v-if="errors.txPower" class="text-[10px] mt-1 text-crit">{{ errors.txPower }}</p>
            </div>
            <div>
              <label class="form-label" for="device-temp">Temperature (°C)</label>
              <input id="device-temp" v-model.number="form.temperature" type="number" class="form-input"
                     :class="{ 'border-red-500': errors.temperature }"
                     @blur="validateField('temperature')"/>
              <p v-if="errors.temperature" class="text-[10px] mt-1 text-crit">{{ errors.temperature }}</p>
            </div>
          </div>
          <div class="flex justify-end gap-2 mt-5">
            <button class="btn" @click="closeModal" :disabled="submitting">Cancel</button>
            <button class="btn btn-primary" @click="addDevice" :disabled="submitting">
              {{ submitting ? 'Menyimpan...' : 'Add Device' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="toastVis" class="toast">{{ toast }}</div>
    </Transition>
  </div>
</template>
