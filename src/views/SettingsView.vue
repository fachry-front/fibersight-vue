<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useThemeStore } from '@/store/useThemeStore.js'
import { useAlarmStore } from '@/store/useAlarmStore.js'

const themeStore = useThemeStore()
const alarmStore = useAlarmStore()
const toast      = ref('')
const toastVis   = ref(false)
const now        = ref(new Date())
let toastTimer
let clockTimer

// ── Persist ke localStorage ──
function loadSetting(key, defaults) {
  try {
    const saved = localStorage.getItem(`fibersight_settings_${key}`)
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults
  } catch { return defaults }
}
function saveSetting(key, value) {
  localStorage.setItem(`fibersight_settings_${key}`, JSON.stringify(value))
}

// ── State — load dari localStorage saat mount ──
const toggles = reactive(loadSetting('toggles', {
  emailNotif: true, smsNotif: false, mqttTLS: true,
  autoAck: false, liveUpdate: true,
  autoTheme: true,  // auto dark/light berdasarkan jam
}))
toggles.autoTheme = true

const thresholds = reactive(loadSetting('thresholds', {
  rxCritical: -28, rxWarning: -24,
  tempCritical: 65, tempWarning: 55,
}))

const mqtt = reactive(loadSetting('mqtt', {
  broker: 'mqtt://192.168.1.100', port: 1883,
  topic: 'fibersight/+/status', interval: 4,
  clientId: 'fibersight-noc-01',
}))

const profile = reactive(loadSetting('profile', {
  name: 'Admin', role: 'NOC Engineer', email: 'admin@fibersight.id',
}))

onMounted(() => {
  toggles.autoTheme = true
  themeStore.resetToAuto()
  clockTimer = setInterval(() => {
    now.value = new Date()
    themeStore.autoCheckTime()
  }, 60 * 1000)
})

onUnmounted(() => clearInterval(clockTimer))

function save(key, data, label) {
  saveSetting(key, data)
  showToast(`✓ ${label} tersimpan`)
  if (key === 'thresholds') {
    alarmStore.syncFromDevices()
  }
}

function showToast(msg) {
  clearTimeout(toastTimer)
  toast.value = msg
  toastVis.value = true
  toastTimer = setTimeout(() => toastVis.value = false, 2400)
}

// Cek apakah jam sekarang seharusnya dark
const autoModeLabel = computed(() => {
  const hour = now.value.getHours()
  const minute = now.value.getMinutes()
  const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
  const isDarkTime = themeStore.shouldBeDark(now.value)
  const mode = isDarkTime ? 'Dark Mode' : 'Light Mode'
  const range = isDarkTime ? '17:00-05:00' : '05:01-16:59'

  return `${mode} aktif (jam ${time}, range ${range})`
})
</script>

<template>
  <div class="space-y-3">
    <div class="page-hdr">
      <div>
        <div class="page-title">Settings</div>
        <div class="page-subtitle">System configuration & preferences</div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">

      <!-- ── Theme ── -->
      <div class="card">
        <div class="card-title mb-3">🌙 Appearance</div>

        <!-- Auto theme toggle -->
        <div class="flex items-center justify-between py-2.5 border-b"
             style="border-color:rgba(160,158,140,0.07)">
          <div>
            <div class="text-xs font-medium">Auto Dark/Light Mode</div>
            <div class="text-[10px] mt-0.5" style="color:#565248">
              17:00–05:00 → Dark · 05:01–16:59 → Light
            </div>
            <div class="text-[10px] mt-0.5 font-mono" style="color:var(--accent-gold)">
              {{ autoModeLabel }}
            </div>
          </div>
          <div class="toggle-track on"
               aria-label="Auto theme is always enabled"
               title="Auto theme selalu aktif sesuai jadwal"
               style="cursor:not-allowed">
            <div class="toggle-thumb"></div>
          </div>
        </div>

        <!-- Manual mode is disabled because theme follows the schedule. -->
        <div class="flex items-center justify-between py-2.5"
             style="border-color:rgba(160,158,140,0.07)"
             :style="'opacity:0.55;pointer-events:none'">
          <div>
            <div class="text-xs font-medium">Manual Mode</div>
            <div class="text-[10px] mt-0.5" style="color:#565248">
              Dinonaktifkan. Tema wajib mengikuti jadwal sistem.
            </div>
          </div>
          <div class="toggle-track">
            <div class="toggle-thumb"></div>
          </div>
        </div>
      </div>

      <!-- ── Alarm Thresholds ── -->
      <div class="card">
        <div class="card-title mb-3">⚡ Alarm Thresholds</div>

        <div class="space-y-3">
          <div v-for="f in [
            { key:'rxCritical',   label:'Rx Power Critical',    unit:'dBm', sub:'Critical alarm di bawah nilai ini' },
            { key:'rxWarning',    label:'Rx Power Warning',     unit:'dBm', sub:'Warning alarm di bawah nilai ini' },
            { key:'tempCritical', label:'Temperature Critical', unit:'°C',  sub:'Alert suhu terlalu tinggi (critical)' },
            { key:'tempWarning',  label:'Temperature Warning',  unit:'°C',  sub:'Alert suhu tinggi (warning)' },
          ]" :key="f.key"
               class="flex items-center justify-between py-2 border-b"
               style="border-color:rgba(160,158,140,0.07)">
            <div>
              <div class="text-xs font-medium">{{ f.label }}</div>
              <div class="text-[10px] mt-0.5" style="color:#565248">{{ f.sub }}</div>
            </div>
            <div class="flex items-center gap-2">
              <input v-model.number="thresholds[f.key]" type="number" step="1"
                     class="form-input text-[11px] font-mono text-right"
                     style="width:72px;padding:4px 8px" :aria-label="f.label"/>
              <span class="text-[10px] font-mono text-gold">{{ f.unit }}</span>
            </div>
          </div>
        </div>

        <button class="btn btn-primary btn-xs mt-4"
                @click="save('thresholds', thresholds, 'Threshold Settings')">
          Save Thresholds
        </button>
      </div>

      <!-- ── MQTT Config ── -->
      <div class="card">
        <div class="card-title mb-3">📡 MQTT Configuration</div>

        <div class="space-y-3">
          <div>
            <label class="form-label" for="mqtt-broker">Broker Address</label>
            <input id="mqtt-broker" v-model="mqtt.broker" class="form-input"/>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="form-label" for="mqtt-port">Port</label>
              <input id="mqtt-port" v-model.number="mqtt.port" type="number" class="form-input"/>
            </div>
            <div>
              <label class="form-label" for="mqtt-interval">Poll Interval (s)</label>
              <input id="mqtt-interval" v-model.number="mqtt.interval" type="number" class="form-input"/>
            </div>
          </div>
          <div>
            <label class="form-label" for="mqtt-topic">Topic</label>
            <input id="mqtt-topic" v-model="mqtt.topic" class="form-input"/>
          </div>
          <div>
            <label class="form-label" for="mqtt-client">Client ID</label>
            <input id="mqtt-client" v-model="mqtt.clientId" class="form-input"/>
          </div>
          <div class="flex items-center justify-between py-2 border-t"
               style="border-color:rgba(160,158,140,0.07)">
            <div>
              <div class="text-xs font-medium">Enable TLS</div>
              <div class="text-[10px] mt-0.5" style="color:#565248">Enkripsi koneksi MQTT</div>
            </div>
            <div class="toggle-track" :class="{ on: toggles.mqttTLS }"
                 @click="toggles.mqttTLS = !toggles.mqttTLS">
              <div class="toggle-thumb"></div>
            </div>
          </div>
        </div>

        <button class="btn btn-primary btn-xs mt-4"
                @click="save('mqtt', mqtt, 'MQTT Config')">
          Save MQTT Config
        </button>
      </div>

      <!-- ── Notifications ── -->
      <div class="card">
        <div class="card-title mb-3">🔔 Notifications & Automation</div>

        <div class="space-y-1">
          <div v-for="(item, key) in {
            emailNotif:  { label:'Email Notifications',  sub:'Kirim alert via email' },
            smsNotif:    { label:'SMS Notifications',    sub:'SMS untuk critical alarm' },
            autoAck:     { label:'Auto Acknowledge',     sub:'Auto-ack alarm yang resolved' },
            liveUpdate:  { label:'Live Data Update',     sub:'Simulasi data IoT tiap 4 detik' },
          }" :key="key"
               class="flex items-center justify-between py-2.5 border-b"
               style="border-color:rgba(160,158,140,0.07)">
            <div>
              <div class="text-xs font-medium">{{ item.label }}</div>
              <div class="text-[10px] mt-0.5" style="color:#565248">{{ item.sub }}</div>
            </div>
            <div class="toggle-track" :class="{ on: toggles[key] }"
                 @click="toggles[key] = !toggles[key]">
              <div class="toggle-thumb"></div>
            </div>
          </div>
        </div>

        <button class="btn btn-primary btn-xs mt-4"
                @click="save('toggles', toggles, 'Notifications')">
          Save Notifications
        </button>
      </div>

      <!-- ── Profile ── -->
      <div class="card">
        <div class="card-title mb-3">👤 Profile</div>

        <div class="space-y-3">
          <div>
            <label class="form-label" for="profile-name">Display Name</label>
            <input id="profile-name" v-model="profile.name" class="form-input"/>
          </div>
          <div>
            <label class="form-label" for="profile-role">Role</label>
            <input id="profile-role" v-model="profile.role" class="form-input"/>
          </div>
          <div>
            <label class="form-label" for="profile-email">Email</label>
            <input id="profile-email" v-model="profile.email" type="email" class="form-input"/>
          </div>
        </div>

        <button class="btn btn-primary btn-xs mt-4"
                @click="save('profile', profile, 'Profile')">
          Save Profile
        </button>
      </div>

      <!-- ── System Info ── -->
      <div class="card">
        <div class="card-title mb-3">⊙ System Info</div>

        <div class="space-y-1">
          <div v-for="s in [
            { label:'Framework',        val:'Vue 3 + Vite + Pinia' },
            { label:'HTTP Client',      val:'Axios + Interceptors' },
            { label:'Charts',           val:'ApexCharts v5' },
            { label:'Topology',         val:'vis-network' },
            { label:'Maps',             val:'Vue Leaflet' },
            { label:'Testing',          val:'Vitest + Vue Test Utils + MSW' },
            { label:'Data Collection',  val:'Active', ok:true },
            { label:'MQTT Broker',      val:'Connected', ok:true },
            { label:'API Server',       val:'Healthy', ok:true },
            { label:'Database',         val:'Healthy', ok:true },
          ]" :key="s.label"
               class="flex items-center justify-between py-1.5 border-b"
               style="border-color:rgba(160,158,140,0.05)">
            <span class="text-[11px]" style="color:#565248">{{ s.label }}</span>
            <span class="text-[11px] font-mono" :class="s.ok ? 'text-ok' : 'text-gold'">
              {{ s.val }}
            </span>
          </div>
        </div>

        <div class="flex gap-2 mt-4">
          <button class="btn btn-xs"
                  @click="() => { localStorage.clear(); showToast('Cache cleared — refresh halaman') }">
            Clear Cache
          </button>
          <button class="btn btn-xs btn-danger"
                  @click="() => {
                    localStorage.removeItem('fibersight_settings_toggles')
                    localStorage.removeItem('fibersight_settings_thresholds')
                    localStorage.removeItem('fibersight_settings_mqtt')
                    localStorage.removeItem('fibersight_settings_profile')
                    showToast('Settings reset ke default')
                  }">
            Reset Settings
          </button>
        </div>

        <div class="text-[9px] font-mono mt-3 pt-2 border-t text-center"
             style="color:#3a3830;border-color:rgba(160,158,140,0.07)">
          © 2026 FiberSight v1.0.0 — Vue Edition
        </div>
      </div>

    </div>

    <!-- Toast -->
    <Transition name="fade">
      <div v-if="toastVis" class="toast">{{ toast }}</div>
    </Transition>
  </div>
</template>
