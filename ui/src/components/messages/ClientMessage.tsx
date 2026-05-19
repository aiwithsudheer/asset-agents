import type { UIMessage } from '../../types'

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

interface Props {
  message: UIMessage
}

export function ClientMessage({ message }: Props) {
  return (
    <div className="flex justify-end animate-fade-in">
      <div className="max-w-[72%]">
        <div className="flex items-center justify-end gap-2 mb-1.5">
          <span className="text-xs text-gray-400">{formatTime(message.timestamp)}</span>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Client
          </span>
        </div>
        <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed">
          {message.content}
        </div>
      </div>
    </div>
  )
}
