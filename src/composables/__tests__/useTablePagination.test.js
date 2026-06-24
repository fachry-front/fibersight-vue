import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useTablePagination } from '@/composables/useTablePagination.js'

function makeData(n) {
  return Array.from({ length: n }, (_, i) => ({ id: `D-${String(i + 1).padStart(2, '0')}`, rxPower: -10 - i }))
}

describe('useTablePagination', () => {
  it('membagi data ke beberapa halaman sesuai pageSize', () => {
    const data = ref(makeData(25))
    const { pagedData, totalPages } = useTablePagination(data, { pageSize: 10 })

    expect(totalPages.value).toBe(3)
    expect(pagedData.value).toHaveLength(10)
  })

  it('nextPage() dan prevPage() mengubah currentPage dengan benar', () => {
    const data = ref(makeData(25))
    const { currentPage, nextPage, prevPage, totalPages } = useTablePagination(data, { pageSize: 10 })

    expect(currentPage.value).toBe(1)
    nextPage()
    expect(currentPage.value).toBe(2)
    nextPage()
    expect(currentPage.value).toBe(3)
    nextPage() // sudah halaman terakhir, tidak boleh lebih dari totalPages
    expect(currentPage.value).toBe(totalPages.value)

    prevPage()
    expect(currentPage.value).toBe(2)
  })

  it('goToPage() membatasi nilai ke rentang valid', () => {
    const data = ref(makeData(25))
    const { currentPage, goToPage, totalPages } = useTablePagination(data, { pageSize: 10 })

    goToPage(99)
    expect(currentPage.value).toBe(totalPages.value)

    goToPage(-5)
    expect(currentPage.value).toBe(1)
  })

  it('toggleSort() mengurutkan data ascending lalu descending', () => {
    const data = ref([
      { id: 'C', rxPower: -30 },
      { id: 'A', rxPower: -10 },
      { id: 'B', rxPower: -20 },
    ])
    const { sortedData, sortKey, sortDir, toggleSort } = useTablePagination(data, { pageSize: 10 })

    toggleSort('id')
    expect(sortKey.value).toBe('id')
    expect(sortDir.value).toBe('asc')
    expect(sortedData.value.map(d => d.id)).toEqual(['A', 'B', 'C'])

    toggleSort('id') // klik lagi -> toggle ke desc
    expect(sortDir.value).toBe('desc')
    expect(sortedData.value.map(d => d.id)).toEqual(['C', 'B', 'A'])
  })

  it('toggleSort() bisa mengurutkan kolom numerik', () => {
    const data = ref([
      { id: 'A', rxPower: -30 },
      { id: 'B', rxPower: -10 },
      { id: 'C', rxPower: -20 },
    ])
    const { sortedData, toggleSort } = useTablePagination(data, { pageSize: 10 })

    toggleSort('rxPower')
    expect(sortedData.value.map(d => d.rxPower)).toEqual([-30, -20, -10])
  })

  it('toggleSort() ke kolom baru reset currentPage ke 1', () => {
    const data = ref(makeData(25))
    const { currentPage, nextPage, toggleSort } = useTablePagination(data, { pageSize: 10 })

    nextPage()
    expect(currentPage.value).toBe(2)

    toggleSort('rxPower')
    expect(currentPage.value).toBe(1)
  })
})
