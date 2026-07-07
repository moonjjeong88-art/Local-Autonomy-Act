import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataPath = join(__dirname, '../data/questions.json')

type Question = {
  id: string
  number: number
  chapter: number
  question: string
  choices: string[]
  answerIndex: number
  explanation: string
  lawRef: string
}

const EXPECTED_CHAPTER_COUNTS: Record<number, number> = {
  1: 8,
  2: 10,
  3: 8,
  4: 1,
  5: 28,
  6: 15,
  7: 12,
  8: 7,
  9: 6,
  10: 1,
  11: 2,
  12: 2,
}

const ARTICLE_TRIVIA = /^지방자치법\s*제\d+조(?:의\d+)?(?:제\d+항)?에\s*규정된/

let errors = 0
const questions = JSON.parse(readFileSync(dataPath, 'utf-8')) as Question[]

if (questions.length !== 100) {
  console.error(`Expected 100 questions, got ${questions.length}`)
  errors++
}

const ids = new Set<string>()
const chapterCounts: Record<number, number> = {}
const answerCounts = [0, 0, 0, 0]

for (const q of questions) {
  if (ids.has(q.id)) {
    console.error(`Duplicate id: ${q.id}`)
    errors++
  }
  ids.add(q.id)

  if (q.choices.length !== 4) {
    console.error(`${q.id}: choices must be 4, got ${q.choices.length}`)
    errors++
  }

  if (q.answerIndex < 0 || q.answerIndex > 3) {
    console.error(`${q.id}: invalid answerIndex ${q.answerIndex}`)
    errors++
  }

  if (new Set(q.choices).size !== q.choices.length) {
    console.error(`${q.id}: duplicate choices`)
    errors++
  }

  for (const choice of q.choices) {
    if (choice.length < 2) {
      console.error(`${q.id}: choice too short: "${choice}"`)
      errors++
    }
    if (['다.', '수 있다.', '야 한다.'].includes(choice)) {
      console.error(`${q.id}: orphan fragment choice: "${choice}"`)
      errors++
    }
  }

  if (ARTICLE_TRIVIA.test(q.question)) {
    console.warn(`${q.id}: possible article-trivia question: ${q.question.slice(0, 60)}`)
  }

  chapterCounts[q.chapter] = (chapterCounts[q.chapter] ?? 0) + 1
  answerCounts[q.answerIndex]++
}

for (const [chapter, expected] of Object.entries(EXPECTED_CHAPTER_COUNTS)) {
  const actual = chapterCounts[Number(chapter)] ?? 0
  if (actual !== expected) {
    console.error(`Chapter ${chapter}: expected ${expected}, got ${actual}`)
    errors++
  }
}

for (let i = 0; i < 4; i++) {
  if (answerCounts[i] !== 25) {
    console.error(`Answer ${i + 1}: expected 25, got ${answerCounts[i]}`)
    errors++
  }
}

console.log(`Validated ${questions.length} questions`)
console.log('Chapter counts:', chapterCounts)
console.log('Answer distribution:', {
  1: answerCounts[0],
  2: answerCounts[1],
  3: answerCounts[2],
  4: answerCounts[3],
})

if (errors > 0) {
  console.error(`\n${errors} error(s) found`)
  process.exit(1)
}

console.log('All questions passed validation')
