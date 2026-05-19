import { useState } from 'react'
import { CheckCircleIcon, ChevronRightIcon, SearchIcon, DatabaseIcon, SaveIcon } from 'lucide-react'
import type { UIMessage, ResearchStep } from '../../types'
import { MarkdownText } from '../MarkdownText'

function StepIcon({ step }: { step: ResearchStep }) {
  const c = step.content.toLowerCase()
  if (step.done) return <CheckCircleIcon size={12} className="text-green-500 flex-shrink-0 mt-0.5" />
  if (c.includes('search') || c.includes('web'))
    return <SearchIcon size={12} className="text-amber-500 flex-shrink-0 mt-0.5 animate-pulse" />
  if (c.includes('saving'))
    return <SaveIcon size={12} className="text-amber-500 flex-shrink-0 mt-0.5 animate-pulse" />
  return <DatabaseIcon size={12} className="text-amber-500 flex-shrink-0 mt-0.5 animate-pulse" />
}

interface Props {
  message: UIMessage
}

export function ResearchPanel({ message }: Props) {
  const steps = message.researchSteps ?? []
  const complete = message.researchComplete
  const [expanded, setExpanded] = useState(false)

  const hasContent = steps.length > 0 || message.advisorQuery || message.analystResponse

  if (complete) {
    return (
      <div className="animate-fade-in my-1">
        {/* Collapsed / expanded toggle — styled like Claude Code's Thinking button */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-gray-200" />
          <button
            onClick={() => setExpanded(e => !e)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors whitespace-nowrap"
          >
            <ChevronRightIcon
              size={11}
              className={`transition-transform duration-150 ${expanded ? 'rotate-90' : ''}`}
            />
            <CheckCircleIcon size={11} className="text-green-500 ml-0.5" />
            Analyst · {steps.length} {steps.length === 1 ? 'query' : 'queries'}
          </button>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {expanded && hasContent && (
          <div className="mt-1.5 mx-1 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden text-xs">
            {message.advisorQuery && (
              <div className="px-3 py-2 border-b border-gray-200">
                <p className="font-semibold text-gray-400 uppercase tracking-wide text-[10px] mb-1">Advisor asked</p>
                <p className="text-gray-600 italic leading-relaxed">{message.advisorQuery}</p>
              </div>
            )}
            {steps.length > 0 && (
              <div className="px-3 py-2 space-y-1.5 border-b border-gray-200">
                {steps.map(step => (
                  <div key={step.id} className="flex items-start gap-2">
                    <CheckCircleIcon size={11} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">{step.content}</span>
                  </div>
                ))}
              </div>
            )}
            {message.analystResponse && (
              <div className="px-3 py-2">
                <p className="font-semibold text-gray-400 uppercase tracking-wide text-[10px] mb-1">Analyst responded</p>
                <div className="text-gray-600 leading-relaxed">
                  <MarkdownText text={message.analystResponse} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Active research panel
  return (
    <div className="animate-fade-in rounded-xl border border-amber-200 bg-amber-50 overflow-hidden">
      {/* Header row — click to collapse/expand */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-amber-100/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <ChevronRightIcon
            size={13}
            className={`text-amber-600 transition-transform duration-150 ${expanded ? 'rotate-90' : ''}`}
          />
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
      </button>

      {expanded && (
        <div className="px-4 pb-3 border-t border-amber-200/60">
          {message.advisorQuery && (
            <div className="mt-2 mb-2.5 text-xs text-amber-700/70 italic leading-relaxed border-l-2 border-amber-300 pl-2">
              {message.advisorQuery}
            </div>
          )}
          {steps.length === 0 ? (
            <p className="mt-2 text-xs text-amber-700">Consulting analyst…</p>
          ) : (
            <div className="mt-2 space-y-2">
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
      )}
    </div>
  )
}
