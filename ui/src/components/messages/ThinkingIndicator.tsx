interface Props {
  who: 'advisor' | 'client'
}

export function ThinkingIndicator({ who }: Props) {
  return (
    <div
      className={`flex items-end gap-2 animate-fade-in ${
        who === 'advisor' ? 'justify-start' : 'justify-end'
      }`}
    >
      {who === 'advisor' && (
        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mb-1">
          <span className="text-white text-xs font-semibold">A</span>
        </div>
      )}
      <div
        className={`px-4 py-3 rounded-2xl border ${
          who === 'advisor'
            ? 'bg-white border-gray-200 border-l-2 border-l-blue-600 rounded-tl-sm shadow-sm'
            : 'bg-gray-100 border-transparent rounded-tr-sm'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
            style={{ animationDelay: '0ms' }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
            style={{ animationDelay: '150ms' }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
    </div>
  )
}
