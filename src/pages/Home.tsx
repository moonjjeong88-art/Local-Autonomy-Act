import { useNavigate } from 'react-router-dom'
import { ChapterGrid } from '../components/ChapterGrid'
import { getAllQuestions } from '../lib/questions'
import { getWrongAnswerIds } from '../lib/storage'
import { useStats } from '../hooks/useStats'

export function Home() {
  const navigate = useNavigate()
  const stats = useStats()
  const wrongCount = getWrongAnswerIds().length
  const totalQuestions = getAllQuestions().length
  const accuracy =
    stats.totalAnswered > 0
      ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100)
      : null

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">지방자치법 문제풀이</h1>
        <p className="mt-2 text-sm text-slate-600 sm:text-base">
          지방자치법(법률 제21447호) 기반 4지선다 객관식 100문항
        </p>
        <p className="mt-1 text-xs text-slate-400">총 {totalQuestions}문항 · 공무원 시험 유형</p>
      </header>

      {(stats.totalAnswered > 0 || wrongCount > 0) && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.totalAnswered}</p>
            <p className="text-xs text-slate-500">누적 풀이</p>
          </div>
          {accuracy !== null && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{accuracy}%</p>
              <p className="text-xs text-slate-500">누적 정답률</p>
            </div>
          )}
          <div className="col-span-2 rounded-xl border border-slate-200 bg-white p-4 text-center sm:col-span-1">
            <p className="text-2xl font-bold text-red-500">{wrongCount}</p>
            <p className="text-xs text-slate-500">오답노트</p>
          </div>
        </div>
      )}

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">학습 모드</h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate('/quiz?mode=random')}
            className="flex-1 rounded-xl bg-blue-600 px-6 py-4 font-semibold text-white transition-colors hover:bg-blue-700 active:scale-[0.99]"
          >
            전체 랜덤 풀기
          </button>
          <button
            type="button"
            onClick={() => navigate('/quiz?mode=wrong')}
            disabled={wrongCount === 0}
            className="flex-1 rounded-xl border-2 border-red-300 bg-white px-6 py-4 font-semibold text-red-600 transition-colors hover:bg-red-50 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
          >
            오답만 다시 ({wrongCount})
          </button>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-slate-700">장별 학습</h2>
        <ChapterGrid onSelect={(chapter) => navigate(`/quiz?mode=chapter&chapter=${chapter}`)} />
      </section>

      <footer className="mt-10 rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-800">
        본 앱은 학습 보조 도구이며 법률 자문을 대체하지 않습니다. 조문은 법제처 국가법령정보센터
        자료를 기준으로 합니다.
      </footer>
    </div>
  )
}
