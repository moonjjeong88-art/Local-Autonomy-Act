import type { Question } from '../types/question'
import questionsData from '../../data/questions.json'

const ALL_QUESTIONS = questionsData as Question[]

export function getAllQuestions(): Question[] {
  return ALL_QUESTIONS
}

export function getQuestionById(id: string): Question | undefined {
  return ALL_QUESTIONS.find((q) => q.id === id)
}

export function getQuestionsByChapter(chapter: number): Question[] {
  return ALL_QUESTIONS.filter((q) => q.chapter === chapter)
}

export function shuffleQuestions(questions: Question[]): Question[] {
  const copy = [...questions]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function getQuestionsByIds(ids: string[]): Question[] {
  const map = new Map(ALL_QUESTIONS.map((q) => [q.id, q]))
  return ids.map((id) => map.get(id)).filter((q): q is Question => q !== undefined)
}
