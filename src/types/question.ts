export type Question = {
  id: string
  number: number
  chapter: number
  question: string
  choices: [string, string, string, string]
  answerIndex: 0 | 1 | 2 | 3
  explanation: string
  lawRef: string
}

export type QuizMode = 'random' | 'chapter' | 'wrong'

export type QuizResult = {
  total: number
  correct: number
  wrongIds: string[]
}
