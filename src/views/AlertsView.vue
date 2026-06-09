<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAlarmStore }  from '@/store/useAlarmStore.js'
import { useDeviceStore } from '@/store/useDeviceStore.js'
import BaseBadge from '@/components/common/BaseBadge.vue'

const alarmSt  = useAlarmStore()
const deviceSt = useDeviceStore()
const dismissing = ref(new Set())

onMounted(() => alarmSt.syncFromDevices())

const critAlarms = computed(() => alarmSt.critical)
const warnAlarms = computed(() => alarmSt.warnings)
const unackCount = computed(() => alarmSt.unackCount)

function acknowledge(id) {
  const d = new Set(dismissing.value); d.add(id); dismissing.value = d
  setTimeout(() => {
    alarmSt.acknowledge(id)
    const nd = new Set(dismissing.value); nd.delete(id); dismissing.value = nd
  }, 350)
}

function acknowledgeAll() { alarmSt.acknowledgeAll() }

const toast = ref(''); const toastVis = ref(false); let toastTimer
function showToast(msg) {
  clearTimeout(toastTimer); toast.value = msg; toastVis.value = true
  toastTimer = setTimeout(() => toastVis.value = false, 2500)
}

function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit', second:'2-digit' })
}
</script>

<template>
  <div class="space-y-3">
    <div class="page-hdr">
      <div>
        <div class="page-title">Alarm Center</div>
        <div class="page-subtitle">{{ unackCount }} alarm belum di-acknowledge</div>
      </div>
      <button v-if="unackCount > 0" class="btn btn-xs btn-primary" @click="acknowledgeAll">
        ✓ Acknowledge All
      </button>
    </div>

    <!-- Summary -->
    <div class="grid grid-cols-4 gap-3">
      <div class="card stat-card" style="--accent:#c45252">
        <div class="stat-lbl">Critical</div>
        <div class="stat-val text-crit">{{ critAlarms.length }}</div>
        <div class="stat-delta">Active alarms</div>
      </div>
      <div class="card stat-card" style="--accent:#c4a23e">
        <div class="stat-lbl">Warning</div>
        <div class="stat-val text-warn">{{ warnAlarms.length }}</div>
        <div class="stat-delta">Active warnings</div>
      </div>
      <div class="card stat-card" style="--accent:#4a9080">
        <div class="stat-lbl">Unacknowledged</div>
        <div class="stat-val">{{ unackCount }}</div>
        <div class="stat-delta">Pending action</div>
      </div>
      <div class="card stat-card" style="--accent:#7aad68">
        <div class="stat-lbl">Total Alarms</div>
        <div class="stat-val">{{ alarmSt.alarms.length }}</div>
        <div class="stat-delta">This session</div>
      </div>
    </div>

    <!-- Two-column alarm list -->
    <div class="grid grid-cols-2 gap-3">

      <!-- Critical -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title text-crit">⚠ Critical Alarms</div>
            <div class="text-[10px] mt-0.5" style="color:#565248">Immediate action required</div>
          </div>
        </div>
        <div class="space-y-2">
          <div
            v-for="alarm in critAlarms" :key="alarm.id"
            class="flex items-start gap-3 p-3 rounded-lg transition-all duration-300"
            :class="{ 'opacity-0 translate-x-4': dismissing.has(alarm.id) }"
            style="border-left:2px solid #c45252;background:rgba(196,82,82,0.05)">
            <div class="text-lg flex-shrink-0">🔴</div>
            <div class="flex-1 min-w-0">
              <div class="text-xs font-bold font-mono">{{ alarm.device }}</div>
              <div class="text-xs mt-0.5" style="color:#9a9688">{{ alarm.detail }}</div>
              <div class="text-[10px] mt-0.5" style="color:#565248">{{ alarm.location }}</div>
              <div class="flex items-center gap-2 mt-2">
                <span class="text-[10px] font-mono" style="color:#565248">{{ fmtTime(alarm.time) }}</span>
                <span v-if="alarmSt.isAcknowledged(alarm.id)"
                      class="text-[10px] font-mono text-ok">✓ Acknowledged</span>
                <button v-else class="btn btn-xs btn-danger ml-auto" @click="acknowledge(alarm.id)">
                  Acknowledge
                </button>
              </div>
            </div>
          </div>
          <div v-if="!critAlarms.length"
               class="flex flex-col items-center py-8 gap-2">
            <div class="text-2xl">✓</div>
            <div class="text-[10px] font-mono text-ok">No critical alarms</div>
          </div>
        </div>
      </div>

      <!-- Warning -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title text-warn">⚡ Warning Alarms</div>
            <div class="text-[10px] mt-0.5" style="color:#565248">Monitor closely</div>
          </div>
        </div>
        <div class="space-y-2">
          <div
            v-for="alarm in warnAlarms" :key="alarm.id"
            class="flex items-start gap-3 p-3 rounded-lg transition-all duration-300"
            :class="{ 'opacity-0 translate-x-4': dismissing.has(alarm.id) }"
            style="border-left:2px solid #c4a23e;background:rgba(196,162,62,0.05)">
            <div class="text-lg flex-shrink-0">🟡</div>
            <div class="flex-1 min-w-0">
              <div class="text-xs font-bold font-mono">{{ alarm.device }}</div>
              <div class="text-xs mt-0.5" style="color:#9a9688">{{ alarm.detail }}</div>
              <div class="text-[10px] mt-0.5" style="color:#565248">{{ alarm.location }}</div>
              <div class="flex items-center gap-2 mt-2">
                <span class="text-[10px] font-mono" style="color:#565248">{{ fmtTime(alarm.time) }}</span>
                <span v-if="alarmSt.isAcknowledged(alarm.id)"
                      class="text-[10px] font-mono text-ok">✓ Acknowledged</span>
                <button v-else class="btn btn-xs ml-auto" @click="acknowledge(alarm.id)">
                  Acknowledge
                </button>
              </div>
            </div>
          </div>
          <div v-if="!warnAlarms.length"
               class="flex flex-col items-center py-8 gap-2">
            <div class="text-2xl">✓</div>
            <div class="text-[10px] font-mono text-ok">No warnings</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
