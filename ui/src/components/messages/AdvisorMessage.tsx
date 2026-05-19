import type { UIMessage } from '../../types'

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

interface Props {
  message: UIMessage
}

export function AdvisorMessage({ message }: Props) {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="max-w-[72%]">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-semibold">A</span>
          </div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Advisor
          </span>
          <span className="text-xs text-gray-400">{formatTime(message.timestamp)}</span>
        </div>
        <div className="bg-white border border-gray-200 border-l-2 border-l-blue-600 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-gray-800 leading-relaxed shadow-sm">
          {message.content}
        </div>
      </div>
    </div>
  )
}
