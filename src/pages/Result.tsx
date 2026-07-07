import { useLocation, useNavigate } from 'react-router-dom'
import { getChapterTitle } from '../lib/chapters'
import { getQuestionById } from '../lib/questions'
import type { QuizResult } from '../types/question'

type LocationState = {
  result: QuizResult
  mode?: string
  chapter?: number
}

export function Result() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null

  if (!state?.result) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="mb-4 text-slate-700">결과 정보가 없습니다.</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white"
        >
          홈으로
        </button>
      </div>
    )
  }

  const { result, mode, chapter } = state
  const percentage = Math.round((result.correct / result.total) * 100)

  const retry = () => {
    if (mode === 'chapter' && chapter) {
      navigate(`/quiz?mode=chapter&chapter=${chapter}`)
    } else if (mode === 'wrong') {
      navigate('/quiz?mode=wrong')
    } else {
      navigate('/quiz?mode=random')
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">학습 결과</h1>
        {chapter && <p className="mt-1 text-sm text-slate-500">{getChapterTitle(chapter)}</p>}
        <p className="mt-6 text-5xl font-bold text-blue-600">{percentage}%</p>
        <p className="mt-2 text-slate-600">
          {result.correct} / {result.total} 정답
        </p>
      </div>

      {result.wrongIds.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 font-semibold text-slate-800">
            틀린 문제 ({result.wrongIds.length})
          </h2>
          <div className="flex flex-col gap-3">
            {result.wrongIds.map((id) => {
              const q = getQuestionById(id)
              if (!q) return null
              return (
                <div key={id} className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="mb-1 text-xs font-medium text-red-600">
                    {q.number}번 · {getChapterTitle(q.chapter)}
                  </p>
                  <p className="mb-2 text-sm font-medium text-slate-900">{q.question}</p>
                  <p className="text-sm text-green-700">
                    정답: {q.answerIndex + 1}번. {q.choices[q.answerIndex]}
                  </p>
                  <p className="mt-2 text-xs text-slate-600">{q.explanation}</p>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={retry}
          className="flex-1 rounded-xl bg-blue-600 py-4 font-semibold text-white hover:bg-blue-700"
        >
          다시 풀기
        </button>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex-1 rounded-xl border border-slate-300 bg-white py-4 font-semibold text-slate-700 hover:bg-slate-50"
        >
          홈으로
        </button>
      </div>
    </div>
  )
}
