const WRONG_ANSWERS_KEY = 'law1-wrong-answers'
const STATS_KEY = 'law1-stats'
const STATS_CHANGE_EVENT = 'law1-stats-change'

export type Stats = {
  totalAnswered: number
  totalCorrect: number
}

const EMPTY_STATS: Stats = { totalAnswered: 0, totalCorrect: 0 }

let statsCacheKey: string | null = null
let statsCache: Stats = EMPTY_STATS

export function getWrongAnswerIds(): string[] {
  try {
    const raw = localStorage.getItem(WRONG_ANSWERS_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function addWrongAnswer(id: string): void {
  const current = getWrongAnswerIds()
  if (!current.includes(id)) {
    localStorage.setItem(WRONG_ANSWERS_KEY, JSON.stringify([...current, id]))
  }
}

export function removeWrongAnswer(id: string): void {
  const current = getWrongAnswerIds().filter((x) => x !== id)
  localStorage.setItem(WRONG_ANSWERS_KEY, JSON.stringify(current))
}

export function getStats(): Stats {
  const raw = localStorage.getItem(STATS_KEY)
  const key = raw ?? ''
  if (key === statsCacheKey) return statsCache

  statsCacheKey = key
  try {
    statsCache = raw ? (JSON.parse(raw) as Stats) : EMPTY_STATS
  } catch {
    statsCache = EMPTY_STATS
  }
  return statsCache
}

export function updateStats(answered: number, correct: number): void {
  const current = getStats()
  localStorage.setItem(
    STATS_KEY,
    JSON.stringify({
      totalAnswered: current.totalAnswered + answered,
      totalCorrect: current.totalCorrect + correct,
    }),
  )
  statsCacheKey = null
  window.dispatchEvent(new Event(STATS_CHANGE_EVENT))
}

export function subscribeStats(callback: () => void): () => void {
  const handler = () => callback()
  window.addEventListener(STATS_CHANGE_EVENT, handler)
  window.addEventListener('storage', handler)
  return () => {
    window.removeEventListener(STATS_CHANGE_EVENT, handler)
    window.removeEventListener('storage', handler)
  }
}
