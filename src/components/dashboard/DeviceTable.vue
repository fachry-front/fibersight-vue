<script setup>
import { computed } from 'vue'
import { useDeviceStore, getRxClass } from '@/store/useDeviceStore.js'
import { useTablePagination } from '@/composables/useTablePagination.js'
import { useSearchStore } from '@/store/useSearchStore.js'
import BaseBadge from '@/components/common/BaseBadge.vue'

const store    = useDeviceStore()
const searchSt = useSearchStore()

// Fix 6: gunakan searchStore agar search di header Overview juga berfungsi
const searchQ = computed({
  get: () => searchSt.query,
  set: (v) => searchSt.setQuery(v),
})

const filtered = computed(() => {
  const q = searchQ.value.toLowerCase()
  return store.devices.filter(d =>
    !q || d.id.toLowerCase().includes(q) || d.location.toLowerCase().includes(q)
  )
})

// ── Sorting & pagination (Day 15) ──
const {
  pagedData, sortKey, sortDir, currentPage, totalPages,
  toggleSort, goToPage, nextPage, prevPage,
} = useTablePagination(filtered, { pageSize: 8, initialSortKey: 'id', initialSortDir: 'asc' })

// Kolom yang bisa di-sort + label header
const columns = [
  { key: 'id',          label: 'Device ID' },
  { key: 'type',        label: 'Type' },
  { key: 'location',    label: 'Location' },
  { key: 'rxPower',     label: 'Rx Power (dBm)' },
  { key: 'txPower',     label: 'Tx Power' },
  { key: 'temperature', label: 'Temp' },
  { key: 'status',      label: 'Status' },
  { key: 'uptime',      label: 'Uptime' },
  { key: 'lastSeen',    label: 'Last Seen' },
]

function sortIndicator(key) {
  if (sortKey.value !== key) return ''
  return sortDir.value === 'asc' ? '▲' : '▼'
}

function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit', second:'2-digit' })
}
</script>

<template>
  <div class="card">
    <div class="card-header">
      <div>
        <div class="card-title">Device Status Overview</div>
        <div class="text-[10px] mt-0.5" style="color:var(--text-muted)">
          Klik baris → sync grafik & peta · Klik header kolom untuk sort
        </div>
      </div>
      <div class="relative" style="width:180px">
        <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none"
             style="color:var(--text-muted)" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input v-model="searchQ" type="text" placeholder="Search device..." aria-label="Search devices"
               class="form-input pl-8 py-1.5 text-[11px]"
               @input="goToPage(1)"/>
      </div>
    </div>

    <!-- Scrollable on mobile -->
    <div class="overflow-x-auto -mx-4 px-4">
      <table class="data-table" style="min-width:720px">
        <thead>
          <tr>
            <th v-for="col in columns" :key="col.key"
                class="cursor-pointer select-none"
                role="columnheader" :aria-sort="sortKey===col.key ? (sortDir==='asc'?'ascending':'descending') : 'none'"
                @click="toggleSort(col.key)">
              {{ col.label }} <span class="text-gold">{{ sortIndicator(col.key) }}</span>
            </th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in pagedData" :key="d.id"
              class="cursor-pointer"
              :class="store.selectedDeviceId === d.id ? 'selected' : ''"
              @click="store.selectDevice(d.id)">
            <td class="td-mono font-bold">{{ d.id }}</td>
            <td class="td-mono">{{ d.type }}</td>
            <td class="text-xs">{{ d.location }}</td>
            <td :class="getRxClass(d.rxPower)">{{ d.rxPower }}</td>
            <td class="td-mono">{{ d.txPower }}</td>
            <td class="td-mono"
                :class="d.temperature>=65?'td-crit':d.temperature>=55?'td-warn':''">
              {{ d.temperature }}°
            </td>
            <td><BaseBadge :status="d.status"/></td>
            <td class="td-mono" style="color:var(--text-muted)">{{ d.uptime }}</td>
            <td class="td-mono" style="color:var(--text-muted)">{{ fmtTime(d.lastSeen) }}</td>
            <td>
              <div class="flex gap-1.5">
                <button class="btn btn-xs" aria-label="View device details" @click.stop>👁</button>
                <button class="btn btn-xs" aria-label="View device analytics" @click.stop>📊</button>
              </div>
            </td>
          </tr>
          <tr v-if="pagedData.length === 0">
            <td colspan="10" class="text-center text-xs py-6" style="color:var(--text-muted)">
              Tidak ada device yang cocok.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination controls -->
    <div v-if="totalPages > 1" class="flex items-center justify-between mt-3 pt-3" style="border-top:1px solid var(--border)">
      <span class="text-[10px] font-mono" style="color:var(--text-muted)">
        Halaman {{ currentPage }} dari {{ totalPages }} · {{ filtered.length }} device
      </span>
      <div class="flex gap-1.5">
        <button class="btn btn-xs" :disabled="currentPage===1" aria-label="Previous page" @click="prevPage">‹ Prev</button>
        <button v-for="p in totalPages" :key="p"
                class="btn btn-xs" :class="{ active: currentPage===p }"
                :aria-current="currentPage===p ? 'page' : undefined"
                @click="goToPage(p)">{{ p }}</button>
        <button class="btn btn-xs" :disabled="currentPage===totalPages" aria-label="Next page" @click="nextPage">Next ›</button>
      </div>
    </div>
  </div>
</template>
