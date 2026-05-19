import { CheckCircleIcon, PlusIcon } from 'lucide-react'

interface Props {
  onNewSession: () => void
}

export function SessionEndBanner({ onNewSession }: Props) {
  return (
    <div className="animate-fade-in rounded-xl border border-green-200 bg-green-50 p-5 text-center">
      <div className="flex items-center justify-center gap-2 mb-1">
        <CheckCircleIcon size={16} className="text-green-600" />
        <span className="text-sm font-semibold text-green-800">Advisory Session Complete</span>
      </div>
      <p className="text-xs text-green-700 mb-4">
        A personalised investment recommendation has been delivered.
      </p>
      <button
        onClick={onNewSession}
        className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-green-300 text-green-700 text-sm font-medium rounded-lg hover:bg-green-50 transition-colors"
      >
        <PlusIcon size={14} />
        Start New Session
      </button>
    </div>
  )
}
