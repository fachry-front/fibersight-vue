import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './mocks/server'

// Mulai MSW sebelum semua test, reset handler antar test, matikan setelah selesai.
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
