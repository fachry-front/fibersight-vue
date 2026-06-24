import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// Server MSW dipakai di semua test file via setup.js
export const server = setupServer(...handlers)
