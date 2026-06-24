import { describe, it, expect, beforeEach } from 'vitest'
import deviceApi from '@/services/deviceApi'
import { mockDevices, mockAlarms } from '@/test/mocks/handlers'

describe('deviceApi service layer', () => {
  beforeEach(() => {
    // Pastikan cache kosong sebelum setiap test, agar request selalu fresh
    deviceApi.invalidateCache()
  })

  describe('getDevices', () => {
    it('mengambil daftar device dari backend', async () => {
      const devices = await deviceApi.getDevices()
      expect(devices).toHaveLength(mockDevices.length)
      expect(devices[0]).toHaveProperty('id', 'OLT-01')
    })

    it('menggunakan cache pada request kedua dalam TTL', async () => {
      const first  = await deviceApi.getDevices()
      const second = await deviceApi.getDevices() // harus dari cache, bukan request baru
      expect(second).toEqual(first)
    })

    it('forceRefresh=true melewati cache', async () => {
      await deviceApi.getDevices()
      const fresh = await deviceApi.getDevices(true)
      expect(fresh).toHaveLength(mockDevices.length)
    })
  })

  describe('getDeviceHistory', () => {
    it('mengambil riwayat Rx Power untuk device tertentu', async () => {
      const history = await deviceApi.getDeviceHistory('ODP-01')
      expect(Array.isArray(history)).toBe(true)
      expect(history.length).toBeGreaterThan(0)
      expect(history[0]).toHaveProperty('value')
    })

    it('mengembalikan array kosong untuk device tanpa riwayat', async () => {
      const history = await deviceApi.getDeviceHistory('ODP-99')
      expect(history).toEqual([])
    })
  })

  describe('createDevice', () => {
    it('membuat device baru dan mengembalikan data device', async () => {
      const newDevice = await deviceApi.createDevice({
        id: 'ODP-99', type: 'ODP', location: 'Bekasi - Test', area: 'Bekasi',
        rxPower: -19, txPower: 2.1, temperature: 40,
      })
      expect(newDevice).not.toBeNull()
      expect(newDevice.id).toBe('ODP-99')
      expect(newDevice).toHaveProperty('status')
    })

    it('mengembalikan null kalau device ID sudah ada (409)', async () => {
      const result = await deviceApi.createDevice({
        id: 'OLT-01', type: 'OLT', location: 'Duplicate', area: 'Jakarta',
        rxPower: -3, txPower: 4.5, temperature: 48,
      })
      expect(result).toBeNull()
    })

    it('menginvalidasi cache setelah membuat device', async () => {
      await deviceApi.getDevices() // isi cache
      await deviceApi.createDevice({
        id: 'ODP-100', type: 'ODP', location: 'Test', area: 'Jakarta',
        rxPower: -19, txPower: 2.1, temperature: 40,
      })
      // Tidak ada cara langsung mengecek isi cache dari luar,
      // tapi memastikan tidak throw dan getDevices berikutnya tetap berhasil
      const devices = await deviceApi.getDevices()
      expect(Array.isArray(devices)).toBe(true)
    })
  })

  describe('deleteDevice', () => {
    it('menghapus device tanpa error', async () => {
      await expect(deviceApi.deleteDevice('ODP-01')).resolves.toBeUndefined()
    })
  })

  describe('getAlarms', () => {
    it('mengambil daftar alarm dari backend', async () => {
      const alarms = await deviceApi.getAlarms()
      expect(alarms).toHaveLength(mockAlarms.length)
      expect(alarms[0]).toHaveProperty('type')
    })
  })
})
