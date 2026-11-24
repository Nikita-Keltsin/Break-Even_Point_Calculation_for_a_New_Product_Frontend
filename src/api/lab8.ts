import { api } from '.'
import type { ApiBreakEvenPointJSON, ApiBreakEvenPointListJSON } from './Api'

export type CostResponse = ApiBreakEvenPointJSON & {
  is_mine?: number
  is_liked?: number
  model_url?: string
  angle_x?: number
  angle_y?: number
  rotation_version?: number
  rotation_scheduled?: boolean
  batch?: number
  position?: number
  batch_size?: number
}

type CatalogPage = { items: ApiBreakEvenPointListJSON[]; total: number }

const base = '/api/breakeven_point'
const sessionId = Array.from(crypto.getRandomValues(new Uint8Array(16)), (n) => n.toString(16).padStart(2, '0')).join('')
let feedSession = sessionId
try {
  feedSession = sessionStorage.getItem('feed-session') ?? sessionId
  sessionStorage.setItem('feed-session', feedSession)
} catch { /* Private mode still has an in-memory session. */ }
const headers = { 'X-Feed-Session': feedSession }

export const loadCatalog = (query: Record<string, number | undefined>, signal: AbortSignal) =>
  api.request<CatalogPage>({ path: `${base}/catalog`, method: 'GET', query, signal })

export const prepareFeed = (signal: AbortSignal) =>
  api.request({ path: `${base}/feed/session`, method: 'GET', headers, signal })

export const loadFeed = (id: number | undefined, next: boolean | undefined, signal: AbortSignal) =>
  api.request<CostResponse>({ path: `${base}/feed`, method: 'GET', query: { id, next }, headers, signal })
