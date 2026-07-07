import { useCallback, useMemo, useState } from 'react'
import type { QuizMode, QuizResult } from '../types/question'
import {
  getAllQuestions,
  getQuestionsByChapter,
  getQuestionsByIds,
  shuffleQuestions,
} from '../lib/questions'
import { addWrongAnswer, removeWrongAnswer, updateStats } from '../lib/storage'

type UseQuizOptions = {
  mode: QuizMode
  chapter?: number
  wrongIds?: string[]
}

export function useQuiz({ mode, chapter, wrongIds = [] }: UseQuizOptions) {
  const questions = useMemo(() => {
    if (mode === 'wrong') {
      return shuffleQuestions(getQuestionsByIds(wrongIds))
    }
    if (mode === 'chapter' && chapter) {
      return shuffleQuestions(getQuestionsByChapter(chapter))
    }
    return shuffleQuestions(getAllQuestions())
  }, [mode, chapter, wrongIds])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongIdsInSession, setWrongIdsInSession] = useState<string[]>([])
  const [isFinished, setIsFinished] = useState(false)

  const currentQuestion = questions[currentIndex] ?? null
  const total = questions.length
  const progress = total > 0 ? ((currentIndex + (isAnswered ? 1 : 0)) / total) * 100 : 0

  const selectChoice = useCallback(
    (index: number) => {
      if (!isAnswered) setSelectedIndex(index)
    },
    [isAnswered],
  )

  const submitAnswer = useCallback(() => {
    if (!currentQuestion || isAnswered || selectedIndex === null) return

    setIsAnswered(true)

    const isCorrect = selectedIndex === currentQuestion.answerIndex
    if (isCorrect) {
      setCorrectCount((c) => c + 1)
      removeWrongAnswer(currentQuestion.id)
    } else {
      addWrongAnswer(currentQuestion.id)
      setWrongIdsInSession((ids) =>
        ids.includes(currentQuestion.id) ? ids : [...ids, currentQuestion.id],
      )
    }
  }, [currentQuestion, isAnswered, selectedIndex])

  const goNext = useCallback(() => {
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1)
      setSelectedIndex(null)
      setIsAnswered(false)
    } else {
      updateStats(total, correctCount)
      setIsFinished(true)
    }
  }, [currentIndex, total, correctCount])

  const result: QuizResult | null = isFinished
    ? { total, correct: correctCount, wrongIds: wrongIdsInSession }
    : null

  return {
    questions,
    currentQuestion,
    currentIndex,
    total,
    progress,
    selectedIndex,
    isAnswered,
    isFinished,
    correctCount,
    result,
    selectChoice,
    submitAnswer,
    goNext,
  }
}
