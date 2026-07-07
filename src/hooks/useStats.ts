import { useSyncExternalStore } from 'react'
import { getStats, subscribeStats, type Stats } from '../lib/storage'

export function useStats(): Stats {
  return useSyncExternalStore(subscribeStats, getStats, getStats)
}
