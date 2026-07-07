type ProgressBarProps = {
  progress: number
  current: number
  total: number
}

export function ProgressBar({ progress, current, total }: ProgressBarProps) {
  return (
    <div className="w-full">
      <div className="mb-1 flex justify-between text-sm text-slate-600">
        <span>진행률</span>
        <span>
          {current} / {total}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-300"
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>
    </div>
  )
}
