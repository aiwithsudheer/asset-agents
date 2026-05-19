import { useEffect, useRef } from 'react'
import { WifiIcon, WifiOffIcon } from 'lucide-react'
import type { ClientProfile, UIMessage } from '../types'
import { ClientMessage } from './messages/ClientMessage'
import { AdvisorMessage } from './messages/AdvisorMessage'
import { ResearchPanel } from './messages/ResearchPanel'
import { ThinkingIndicator } from './messages/ThinkingIndicator'
import { SessionEndBanner } from './messages/SessionEndBanner'

const RISK_BADGE: Record<string, string> = {
  conservative: 'bg-emerald-100 text-emerald-700',
  moderate: 'bg-amber-100 text-amber-700',
  aggressive: 'bg-red-100 text-red-700',
}

function whoIsThinking(messages: UIMessage[]): 'advisor' | 'client' | null {
  if (messages.length === 0) return 'advisor'
  const last = messages[messages.length - 1]
  if (last.kind === 'client') return 'advisor'
  if (last.kind === 'advisor') return 'client'
  return null
}

interface Props {
  profile: ClientProfile
  messages: UIMessage[]
  isThinking: boolean
  isComplete: boolean
  isConnected: boolean
  onNewSession: () => void
}

export function ChatArea({ profile, messages, isThinking, isComplete, isConnected, onNewSession }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking])

  const thinker = isThinking ? (whoIsThinking(messages) ?? 'advisor') : null

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-gray-900">{profile.name}</h2>
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${
                RISK_BADGE[profile.risk_tolerance]
              }`}
            >
              {profile.risk_tolerance}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Age {profile.age} &nbsp;·&nbsp; Goal: {profile.goal}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {isConnected ? (
            <>
              <WifiIcon size={13} className="text-green-500" />
              <span className="text-xs text-green-600 font-medium">Live</span>
            </>
          ) : isComplete ? (
            <span className="text-xs text-gray-400">Complete</span>
          ) : (
            <>
              <WifiOffIcon size={13} className="text-gray-400" />
              <span className="text-xs text-gray-400">Disconnected</span>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-4">
          {messages.map(msg => {
            if (msg.kind === 'client')   return <ClientMessage   key={msg.id} message={msg} />
            if (msg.kind === 'advisor')  return <AdvisorMessage  key={msg.id} message={msg} />
            if (msg.kind === 'research') return <ResearchPanel   key={msg.id} message={msg} />
            if (msg.kind === 'end')      return <SessionEndBanner key={msg.id} onNewSession={onNewSession} />
            if (msg.kind === 'error')    return (
              <div key={msg.id} className="text-center text-xs text-red-500 py-2">
                {msg.content}
              </div>
            )
            return null
          })}

          {thinker && <ThinkingIndicator who={thinker} />}

          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  )
}
