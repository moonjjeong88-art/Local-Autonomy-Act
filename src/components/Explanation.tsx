import { getLawRefUrl } from '../lib/chapters'

type ExplanationProps = {
  explanation: string
  lawRef: string
  isCorrect: boolean
}

export function Explanation({ explanation, lawRef, isCorrect }: ExplanationProps) {
  return (
    <div
      className={`mt-4 rounded-xl border p-4 ${
        isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
      }`}
    >
      <p className={`mb-2 font-semibold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
        {isCorrect ? '정답입니다!' : '오답입니다.'}
      </p>
      <p className="mb-3 text-sm leading-relaxed text-slate-700">{explanation}</p>
      <a
        href={getLawRefUrl(lawRef)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
      >
        근거: {lawRef} →
      </a>
    </div>
  )
}
