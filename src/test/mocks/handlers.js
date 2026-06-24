import { http, HttpResponse } from 'msw'

const API_URL = 'http://localhost:3000'

// ── Fixture data ──
export const mockDevices = [
  {
    id: 'OLT-01', type: 'OLT', location: 'Jakarta Pusat - Central Office',
    rxPower: -3.2, txPower: 4.5, temperature: 48, status: 'Normal',
    onu: 64, uptime: '45d 12h', lastSeen: '2026-06-15T10:00:00.000Z',
  },
  {
    id: 'ODP-01', type: 'ODP', location: 'Jakarta Selatan - Kemang',
    rxPower: -18.5, txPower: 2.2, temperature: 42, status: 'Normal',
    onu: 8, uptime: '30d 4h', lastSeen: '2026-06-15T10:00:00.000Z',
  },
  {
    id: 'ODP-02', type: 'ODP', location: 'Jakarta Barat - Kebon Jeruk',
    rxPower: -26.1, txPower: 2.0, temperature: 56, status: 'Warning',
    onu: 6, uptime: '12d 1h', lastSeen: '2026-06-15T10:00:00.000Z',
  },
  {
    id: 'ODP-03', type: 'ODP', location: 'Tangerang - BSD',
    rxPower: -29.4, txPower: 1.8, temperature: 67, status: 'Critical',
    onu: 4, uptime: '2d 6h', lastSeen: '2026-06-15T10:00:00.000Z',
  },
]

export const mockHistory = [
  { time: '2026-06-15T09:58:00.000Z', value: -18.2 },
  { time: '2026-06-15T09:59:00.000Z', value: -18.4 },
  { time: '2026-06-15T10:00:00.000Z', value: -18.5 },
]

export const mockAlarms = [
  { id: 'AL-1', type: 'Warning',  device: 'ODP-02', detail: 'Rx Power di bawah ambang normal', location: 'Jakarta Barat - Kebon Jeruk', time: '2026-06-15T09:55:00.000Z' },
  { id: 'AL-2', type: 'Critical', device: 'ODP-03', detail: 'Rx Power sangat rendah — kemungkinan putus fiber', location: 'Tangerang - BSD', time: '2026-06-15T09:50:00.000Z' },
]

// ── Handlers ──
export const handlers = [
  http.get(`${API_URL}/api/devices`, () => {
    return HttpResponse.json(mockDevices)
  }),

  http.get(`${API_URL}/api/devices/:id/history`, ({ params }) => {
    if (params.id === 'ODP-01') return HttpResponse.json(mockHistory)
    return HttpResponse.json([])
  }),

  http.post(`${API_URL}/api/devices`, async ({ request }) => {
    const body = await request.json()
    if (mockDevices.some(d => d.id === body.id)) {
      return new HttpResponse(JSON.stringify({ message: 'Device already exists' }), { status: 409 })
    }
    return HttpResponse.json({
      ...body,
      status: 'Normal',
      onu: 0,
      uptime: '0d 0h',
      lastSeen: new Date().toISOString(),
    }, { status: 201 })
  }),

  http.delete(`${API_URL}/api/devices/:id`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(`${API_URL}/api/alarms`, () => {
    return HttpResponse.json(mockAlarms)
  }),
]
