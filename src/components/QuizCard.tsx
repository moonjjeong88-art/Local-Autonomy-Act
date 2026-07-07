import type { Question } from '../types/question'
import { getChapterTitle } from '../lib/chapters'
import { Explanation } from './Explanation'

type QuizCardProps = {
  question: Question
  selectedIndex: number | null
  isAnswered: boolean
  onSelect: (index: number) => void
}

export function QuizCard({ question, selectedIndex, isAnswered, onSelect }: QuizCardProps) {
  const isCorrect = selectedIndex === question.answerIndex

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          {question.number}번 문제
        </span>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
          {getChapterTitle(question.chapter)}
        </span>
      </div>

      <h2 className="mb-6 text-base leading-relaxed font-semibold text-slate-900 sm:text-lg">
        {question.question}
      </h2>

      <div className="flex flex-col gap-3">
        {question.choices.map((choice, index) => {
          let style = 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50'
          if (isAnswered) {
            if (index === question.answerIndex) {
              style = 'border-green-500 bg-green-50 text-green-900'
            } else if (index === selectedIndex) {
              style = 'border-red-500 bg-red-50 text-red-900'
            } else {
              style = 'border-slate-200 bg-slate-50 text-slate-500'
            }
          } else if (selectedIndex === index) {
            style = 'border-blue-500 bg-blue-50'
          }

          return (
            <button
              key={index}
              type="button"
              disabled={isAnswered}
              onClick={() => onSelect(index)}
              className={`min-h-12 w-full rounded-xl border-2 px-4 py-3 text-left text-sm transition-colors sm:min-h-14 sm:text-base ${style} ${
                !isAnswered ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default'
              }`}
            >
              <span className="mr-2 font-bold text-slate-500">{index + 1}.</span>
              {choice}
            </button>
          )
        })}
      </div>

      {isAnswered && selectedIndex !== null && (
        <Explanation
          explanation={question.explanation}
          lawRef={question.lawRef}
          isCorrect={isCorrect}
        />
      )}
    </div>
  )
}
