import { CheckCircleIcon, CircleIcon, SearchIcon, DatabaseIcon } from 'lucide-react'
import type { UIMessage, ResearchStep } from '../../types'

function StepIcon({ step }: { step: ResearchStep }) {
  const isWebSearch = step.content.toLowerCase().includes('web') || step.content.toLowerCase().includes('search')

  if (step.done) {
    return <CheckCircleIcon size={13} className="text-amber-600 flex-shrink-0 mt-0.5" />
  }
  if (isWebSearch) {
    return (
      <SearchIcon
        size={13}
        className="text-amber-500 flex-shrink-0 mt-0.5 animate-pulse"
      />
    )
  }
  return (
    <DatabaseIcon
      size={13}
      className="text-amber-500 flex-shrink-0 mt-0.5 animate-pulse"
    />
  )
}

interface Props {
  message: UIMessage
}

export function ResearchPanel({ message }: Props) {
  const steps = message.researchSteps ?? []
  const complete = message.researchComplete

  if (complete) {
    const count = steps.length
    return (
      <div className="animate-fade-in flex items-center gap-2 py-1">
        <div className="flex-1 h-px bg-gray-200" />
        <div className="flex items-center gap-1.5 text-xs text-gray-400 whitespace-nowrap">
          <CheckCircleIcon size={12} className="text-green-500" />
          Research complete
          <span className="text-gray-300">·</span>
          {count} {count === 1 ? 'query' : 'queries'}
        </div>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in rounded-xl border border-amber-200 bg-amber-50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:300ms]" />
          </div>
          <span className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
            Research in Progress
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <CircleIcon size={10} className="text-amber-400 fill-amber-400" />
          <span className="text-xs text-amber-600 font-medium">Client on hold</span>
        </div>
      </div>

      <p className="text-xs text-amber-700 mb-3">
        Advisor is consulting the research team…
      </p>

      {/* Steps */}
      <div className="space-y-2">
        {steps.map(step => (
          <div key={step.id} className="flex items-start gap-2">
            <StepIcon step={step} />
            <span
              className={`text-xs leading-relaxed ${
                step.done ? 'text-amber-700' : 'text-amber-800 font-medium'
              }`}
            >
              {step.content}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
