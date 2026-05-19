import { PlusIcon, TrendingUpIcon, UserIcon } from 'lucide-react'

interface Props {
  hasProfile: boolean
  onNewSession: () => void
  onSetUpProfile: () => void
}

export function EmptyState({ hasProfile, onNewSession, onSetUpProfile }: Props) {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <TrendingUpIcon size={26} className="text-blue-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Investment Advisory System
        </h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          Three AI agents collaborate in real time to deliver a personalised investment
          recommendation. {hasProfile ? 'Start a session to watch them work.' : 'Set up a client profile to get started.'}
        </p>

        {hasProfile ? (
          <button
            onClick={onNewSession}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon size={15} />
            Start Advisory Session
          </button>
        ) : (
          <button
            onClick={onSetUpProfile}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserIcon size={15} />
            Set Up Client Profile
          </button>
        )}
      </div>
    </div>
  )
}
