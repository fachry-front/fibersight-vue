<script setup>
import { ref, reactive } from 'vue'

const toast    = ref('')
const toastVis = ref(false)
let toastTimer

const toggles = reactive({
  emailNotif:  true,
  smsNotif:    false,
  mqttTLS:     true,
  autoAck:     false,
  liveUpdate:  true,
  darkMode:    true,
})

const thresholds = reactive({
  rxCritical:   -28,
  rxWarning:    -24,
  tempCritical:  65,
  tempWarning:   55,
})

const mqtt = reactive({
  broker:   'mqtt://192.168.1.100',
  port:      1883,
  topic:    'fibersight/+/status',
  interval:  4,
  clientId: 'fibersight-noc-01',
})

const profile = reactive({
  name:  'Admin',
  role:  'NOC Engineer',
  email: 'admin@fibersight.id',
})

function save(label) {
  clearTimeout(toastTimer)
  toast.value = `✓ ${label} saved`
  toastVis.value = true
  toastTimer = setTimeout(() => toastVis.value = false, 2400)
}
</script>

<template>
  <div class="space-y-3">
    <div class="page-hdr">
      <div>
        <div class="page-title">Settings</div>
        <div class="page-subtitle">System configuration & preferences</div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3">

      <!-- Alarm Thresholds -->
      <div class="card">
        <div class="card-title mb-3">⚡ Alarm Thresholds</div>

        <div class="space-y-3">
          <div class="flex items-center justify-between py-2 border-b"
               style="border-color:rgba(160,158,140,0.07)">
            <div>
              <div class="text-xs font-medium">Rx Power Critical</div>
              <div class="text-[10px] mt-0.5" style="color:#565248">Trigger critical alarm di bawah nilai ini</div>
            </div>
            <div class="flex items-center gap-2">
              <input v-model.number="thresholds.rxCritical" type="number" step="1"
                     class="form-input text-[11px] font-mono text-right"
                     style="width:72px;padding:4px 8px"/>
              <span class="text-[10px] font-mono text-gold">dBm</span>
            </div>
          </div>

          <div class="flex items-center justify-between py-2 border-b"
               style="border-color:rgba(160,158,140,0.07)">
            <div>
              <div class="text-xs font-medium">Rx Power Warning</div>
              <div class="text-[10px] mt-0.5" style="color:#565248">Trigger warning alarm di bawah nilai ini</div>
            </div>
            <div class="flex items-center gap-2">
              <input v-model.number="thresholds.rxWarning" type="number" step="1"
                     class="form-input text-[11px] font-mono text-right"
                     style="width:72px;padding:4px 8px"/>
              <span class="text-[10px] font-mono text-gold">dBm</span>
            </div>
          </div>

          <div class="flex items-center justify-between py-2 border-b"
               style="border-color:rgba(160,158,140,0.07)">
            <div>
              <div class="text-xs font-medium">Temperature Critical</div>
              <div class="text-[10px] mt-0.5" style="color:#565248">Alert suhu terlalu tinggi</div>
            </div>
            <div class="flex items-center gap-2">
              <input v-model.number="thresholds.tempCritical" type="number"
                     class="form-input text-[11px] font-mono text-right"
                     style="width:72px;padding:4px 8px"/>
              <span class="text-[10px] font-mono text-gold">°C</span>
            </div>
          </div>

          <div class="flex items-center justify-between py-2"
               style="border-color:rgba(160,158,140,0.07)">
            <div>
              <div class="text-xs font-medium">Temperature Warning</div>
            </div>
            <div class="flex items-center gap-2">
              <input v-model.number="thresholds.tempWarning" type="number"
                     class="form-input text-[11px] font-mono text-right"
                     style="width:72px;padding:4px 8px"/>
              <span class="text-[10px] font-mono text-gold">°C</span>
            </div>
          </div>
        </div>

        <button class="btn btn-primary btn-xs mt-4" @click="save('Threshold Settings')">
          Save Thresholds
        </button>
      </div>

      <!-- MQTT Config -->
      <div class="card">
        <div class="card-title mb-3">📡 MQTT Configuration</div>

        <div class="space-y-3">
          <div>
            <label class="form-label">Broker Address</label>
            <input v-model="mqtt.broker" class="form-input"/>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="form-label">Port</label>
              <input v-model.number="mqtt.port" type="number" class="form-input"/>
            </div>
            <div>
              <label class="form-label">Poll Interval (sec)</label>
              <input v-model.number="mqtt.interval" type="number" class="form-input"/>
            </div>
          </div>
          <div>
            <label class="form-label">Topic</label>
            <input v-model="mqtt.topic" class="form-input"/>
          </div>
          <div>
            <label class="form-label">Client ID</label>
            <input v-model="mqtt.clientId" class="form-input"/>
          </div>

          <!-- TLS toggle -->
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

        <button class="btn btn-primary btn-xs mt-4" @click="save('MQTT Config')">
          Save MQTT Config
        </button>
      </div>

      <!-- Notifications -->
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
      </div>

      <!-- System Info + Profile -->
      <div class="card">
        <div class="card-title mb-3">⊙ System & Profile</div>

        <!-- Profile -->
        <div class="space-y-3 mb-4">
          <div>
            <label class="form-label">Display Name</label>
            <input v-model="profile.name" class="form-input"/>
          </div>
          <div>
            <label class="form-label">Role</label>
            <input v-model="profile.role" class="form-input"/>
          </div>
          <div>
            <label class="form-label">Email</label>
            <input v-model="profile.email" class="form-input"/>
          </div>
        </div>

        <button class="btn btn-primary btn-xs mb-4" @click="save('Profile')">
          Save Profile
        </button>

        <!-- System status list -->
        <div class="border-t pt-3" style="border-color:rgba(160,158,140,0.1)">
          <div class="card-title mb-2">System Status</div>
          <div class="space-y-1">
            <div v-for="s in [
              { label:'Framework',        val:'Vue 3 + Vite + Pinia' },
              { label:'Charts',           val:'ApexCharts v3' },
              { label:'Topology',         val:'vis-network v9' },
              { label:'Maps',             val:'Vue Leaflet (OSM)' },
              { label:'Data Collection',  val:'Active', ok:true },
              { label:'MQTT Broker',      val:'Connected', ok:true },
              { label:'API Server',       val:'Healthy', ok:true },
              { label:'Database',         val:'Healthy', ok:true },
            ]" :key="s.label"
                 class="flex items-center justify-between py-1">
              <span class="text-[11px]" style="color:#565248">{{ s.label }}</span>
              <span class="text-[11px] font-mono"
                    :class="s.ok ? 'text-ok' : 'text-gold'">
                {{ s.val }}
              </span>
            </div>
          </div>
          <div class="text-[9px] font-mono mt-3 pt-2 border-t text-center"
               style="color:#3a3830;border-color:rgba(160,158,140,0.07)">
            © 2026 FiberSight v1.0.0 — Vue Edition
          </div>
        </div>
      </div>

    </div>

    <!-- Toast -->
    <Transition name="fade">
      <div v-if="toastVis" class="toast">{{ toast }}</div>
    </Transition>
  </div>
</template>
