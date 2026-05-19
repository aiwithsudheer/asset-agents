import { PlusIcon, MessageSquareIcon, PencilIcon, UserIcon } from 'lucide-react'
import type { ClientProfile, StoredSession } from '../types'

const RISK_COLOR: Record<string, string> = {
  conservative: 'text-emerald-400',
  moderate: 'text-amber-400',
  aggressive: 'text-red-400',
}

const RISK_BADGE: Record<string, string> = {
  conservative: 'bg-emerald-900/40 text-emerald-400',
  moderate: 'bg-amber-900/40 text-amber-400',
  aggressive: 'bg-red-900/40 text-red-400',
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

interface Props {
  profile: ClientProfile | null
  sessions: StoredSession[]
  activeSessionId: string | null
  onSelectSession: (id: string) => void
  onNewSession: () => void
  onEditProfile: () => void
}

export function SessionSidebar({
  profile,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onEditProfile,
}: Props) {
  return (
    <aside className="w-64 flex-shrink-0 bg-gray-900 flex flex-col h-full">
      {/* Brand */}
      <div className="px-4 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center flex-shrink-0">
            <MessageSquareIcon size={14} className="text-white" />
          </div>
          <span className="text-white font-semibold text-sm tracking-wide">
            Investment Advisory
          </span>
        </div>
      </div>

      {/* Client Profile */}
      <div className="px-3 py-3 border-b border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Client Profile
          </span>
          {profile && (
            <button
              onClick={onEditProfile}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              <PencilIcon size={11} />
              Edit
            </button>
          )}
        </div>

        {profile ? (
          <div className="bg-gray-800 rounded-lg px-3 py-2.5">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-semibold">
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-white text-sm font-medium truncate">{profile.name}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <span
                className={`px-1.5 py-0.5 rounded text-xs font-medium capitalize ${
                  RISK_BADGE[profile.risk_tolerance]
                }`}
              >
                {profile.risk_tolerance}
              </span>
              <span className="text-gray-500 text-xs">Age {profile.age}</span>
            </div>
            {profile.goal && (
              <p className="text-gray-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                {profile.goal}
              </p>
            )}
          </div>
        ) : (
          <button
            onClick={onEditProfile}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-700 text-gray-500 text-xs hover:border-gray-500 hover:text-gray-400 transition-colors"
          >
            <UserIcon size={13} />
            Set up client profile
          </button>
        )}
      </div>

      {/* New Session */}
      <div className="px-3 pt-3 pb-2">
        <button
          onClick={onNewSession}
          disabled={!profile}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md border border-gray-700 text-gray-300 text-sm font-medium hover:border-gray-500 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <PlusIcon size={15} />
          New Session
        </button>
        {!profile && (
          <p className="text-xs text-gray-600 text-center mt-1.5">
            Set up a profile first
          </p>
        )}
      </div>

      {/* Sessions list */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {sessions.length > 0 && (
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-2 mb-2">
            Sessions
          </p>
        )}
        <div className="space-y-0.5">
          {sessions.map(s => {
            const isActive = s.session_id === activeSessionId
            return (
              <button
                key={s.session_id}
                onClick={() => onSelectSession(s.session_id)}
                className={`w-full text-left px-3 py-2.5 rounded-md transition-colors ${
                  isActive
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm truncate text-white">
                    {s.profile.name}
                  </span>
                  {!s.complete && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 animate-pulse" />
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-xs font-medium capitalize ${RISK_COLOR[s.profile.risk_tolerance]}`}>
                    {s.profile.risk_tolerance}
                  </span>
                  <span className="text-gray-600 text-xs">·</span>
                  <span className="text-gray-600 text-xs">{formatDate(s.startedAt)}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
