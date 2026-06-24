import { ref, computed } from 'vue'

/**
 * useTablePagination — composable untuk sorting & pagination client-side
 * pada array data reaktif.
 *
 * @param {import('vue').Ref<Array>} dataRef - ref ke array data sumber (sudah difilter kalau perlu)
 * @param {Object} options
 * @param {number} [options.pageSize=10] - jumlah baris per halaman
 * @param {string} [options.initialSortKey=null] - kolom default untuk sort
 * @param {'asc'|'desc'} [options.initialSortDir='asc'] - arah sort default
 *
 * Return:
 *   sortedData    - computed, data setelah di-sort (sebelum dipotong per halaman)
 *   pagedData     - computed, data untuk halaman saat ini saja
 *   sortKey       - ref, kolom yang sedang di-sort
 *   sortDir       - ref, 'asc' | 'desc'
 *   currentPage   - ref, halaman aktif (1-indexed)
 *   totalPages    - computed, total halaman
 *   pageSize      - ref, jumlah baris per halaman (bisa diubah)
 *   toggleSort(key) - klik header kolom untuk sort/toggle arah
 *   goToPage(n)     - pindah ke halaman n
 *   nextPage() / prevPage()
 */
export function useTablePagination(dataRef, options = {}) {
  const {
    pageSize: initialPageSize = 10,
    initialSortKey = null,
    initialSortDir = 'asc',
  } = options

  const sortKey     = ref(initialSortKey)
  const sortDir     = ref(initialSortDir)
  const currentPage = ref(1)
  const pageSize    = ref(initialPageSize)

  const sortedData = computed(() => {
    const data = [...dataRef.value]
    if (!sortKey.value) return data

    return data.sort((a, b) => {
      const aVal = a[sortKey.value]
      const bVal = b[sortKey.value]

      let cmp
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        cmp = aVal - bVal
      } else {
        cmp = String(aVal).localeCompare(String(bVal))
      }

      return sortDir.value === 'asc' ? cmp : -cmp
    })
  })

  const totalPages = computed(() => {
    return Math.max(1, Math.ceil(sortedData.value.length / pageSize.value))
  })

  const pagedData = computed(() => {
    // Clamp currentPage kalau data berubah (misal setelah filter/delete)
    if (currentPage.value > totalPages.value) currentPage.value = totalPages.value
    if (currentPage.value < 1) currentPage.value = 1

    const start = (currentPage.value - 1) * pageSize.value
    return sortedData.value.slice(start, start + pageSize.value)
  })

  function toggleSort(key) {
    if (sortKey.value === key) {
      sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortKey.value = key
      sortDir.value = 'asc'
    }
    currentPage.value = 1 // reset ke halaman pertama saat sort berubah
  }

  function goToPage(n) {
    currentPage.value = Math.min(Math.max(1, n), totalPages.value)
  }

  function nextPage() { goToPage(currentPage.value + 1) }
  function prevPage() { goToPage(currentPage.value - 1) }

  return {
    sortedData, pagedData,
    sortKey, sortDir,
    currentPage, totalPages, pageSize,
    toggleSort, goToPage, nextPage, prevPage,
  }
}
