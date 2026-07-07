import { CHAPTER_QUESTION_COUNTS, CHAPTER_TITLES } from '../lib/chapters'

type ChapterGridProps = {
  onSelect: (chapter: number) => void
}

export function ChapterGrid({ onSelect }: ChapterGridProps) {
  const chapters = Object.keys(CHAPTER_TITLES).map(Number).sort((a, b) => a - b)

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {chapters.map((chapter) => (
        <button
          key={chapter}
          type="button"
          onClick={() => onSelect(chapter)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition-colors hover:border-blue-300 hover:bg-blue-50 active:scale-[0.99]"
        >
          <p className="text-sm font-semibold text-slate-900">{CHAPTER_TITLES[chapter]}</p>
          <p className="mt-0.5 text-xs text-slate-500">{CHAPTER_QUESTION_COUNTS[chapter]}문항</p>
        </button>
      ))}
    </div>
  )
}
