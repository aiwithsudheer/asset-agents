import { useState } from 'react'
import { CheckCircleIcon, ChevronDownIcon, ChevronUpIcon, SearchIcon, DatabaseIcon, SaveIcon } from 'lucide-react'
import type { UIMessage, ResearchStep } from '../../types'

function StepIcon({ step }: { step: ResearchStep }) {
  const c = step.content.toLowerCase()
  if (step.done) return <CheckCircleIcon size={13} className="text-amber-600 flex-shrink-0 mt-0.5" />
  if (c.includes('search') || c.includes('web'))
    return <SearchIcon size={13} className="text-amber-500 flex-shrink-0 mt-0.5 animate-pulse" />
  if (c.includes('saving') || c.includes('knowledge base') && c.includes('sav'))
    return <SaveIcon size={13} className="text-amber-500 flex-shrink-0 mt-0.5 animate-pulse" />
  return <DatabaseIcon size={13} className="text-amber-500 flex-shrink-0 mt-0.5 animate-pulse" />
}

interface Props {
  message: UIMessage
}

export function ResearchPanel({ message }: Props) {
  const steps = message.researchSteps ?? []
  const complete = message.researchComplete
  const [expanded, setExpanded] = useState(false)

  if (complete) {
    return (
      <div className="animate-fade-in my-1">
        <button
          onClick={() => setExpanded(e => !e)}
          className="w-full flex items-center gap-2 py-1 text-xs text-gray-400 hover:text-gray-500 transition-colors group"
        >
          <div className="flex-1 h-px bg-gray-200" />
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <CheckCircleIcon size={12} className="text-green-500" />
            Analyst · {steps.length} {steps.length === 1 ? 'query' : 'queries'}
            {expanded
              ? <ChevronUpIcon size={11} className="text-gray-400" />
              : <ChevronDownIcon size={11} className="text-gray-400" />}
          </span>
          <div className="flex-1 h-px bg-gray-200" />
        </button>

        {expanded && steps.length > 0 && (
          <div className="mx-2 mt-1 px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-200 space-y-1.5">
            {steps.map(step => (
              <div key={step.id} className="flex items-start gap-2">
                <CheckCircleIcon size={12} className="text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-gray-600">{step.content}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="animate-fade-in rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:300ms]" />
          </div>
          <span className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
            Analyst Research
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs text-amber-600 font-medium">Client on hold</span>
        </div>
      </div>

      {steps.length === 0 ? (
        <p className="text-xs text-amber-700">Consulting analyst…</p>
      ) : (
        <div className="space-y-2">
          {steps.map(step => (
            <div key={step.id} className="flex items-start gap-2">
              <StepIcon step={step} />
              <span className={`text-xs leading-relaxed ${
                step.done ? 'text-amber-700' : 'text-amber-800 font-medium'
              }`}>
                {step.content}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
