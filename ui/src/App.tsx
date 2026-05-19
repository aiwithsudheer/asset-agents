import { useState, useEffect, useCallback } from 'react'
import { SessionSidebar } from './components/SessionSidebar'
import { NewSessionModal } from './components/NewSessionModal'
import { ChatArea } from './components/ChatArea'
import { EmptyState } from './components/EmptyState'
import { useAdvisorySession } from './hooks/useAdvisorySession'
import type { ClientProfile, StoredSession } from './types'

const SESSIONS_KEY = 'advisory_sessions'
const PROFILE_KEY = 'advisory_profile'

function loadSessions(): StoredSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY)
    return raw ? (JSON.parse(raw) as StoredSession[]) : []
  } catch {
    return []
  }
}

function loadProfile(): ClientProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    return raw ? (JSON.parse(raw) as ClientProfile) : null
  } catch {
    return null
  }
}

function saveSessions(sessions: StoredSession[]): void {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
}

export default function App() {
  const [sessions, setSessions] = useState<StoredSession[]>(loadSessions)
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(loadProfile)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)

  const {
    messages,
    isConnected,
    isThinking,
    isComplete,
    startSession,
    disconnect,
  } = useAdvisorySession()

  // Persist live messages to localStorage as they stream in
  useEffect(() => {
    if (!activeSessionId || messages.length === 0) return
    setSessions(prev => {
      const next = prev.map(s =>
        s.session_id === activeSessionId
          ? { ...s, messages, complete: isComplete }
          : s,
      )
      saveSessions(next)
      return next
    })
  }, [messages, activeSessionId, isComplete])

  const handleSaveProfile = useCallback((profile: ClientProfile) => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
    setClientProfile(profile)
    setShowProfileModal(false)
  }, [])

  const handleNewSession = useCallback(async () => {
    if (!clientProfile) return
    let session_id: string
    try {
      session_id = await startSession(clientProfile)
    } catch {
      return
    }

    const newSession: StoredSession = {
      session_id,
      profile: clientProfile,
      messages: [],
      startedAt: new Date().toISOString(),
      complete: false,
    }

    setSessions(prev => {
      const next = [newSession, ...prev]
      saveSessions(next)
      return next
    })

    setActiveSessionId(session_id)
  }, [clientProfile, startSession])

  const handleSelectSession = useCallback(
    (id: string) => {
      if (id === activeSessionId) return
      disconnect()
      setActiveSessionId(id)
    },
    [activeSessionId, disconnect],
  )

  const activeSession = sessions.find(s => s.session_id === activeSessionId)
  const isLive = !!activeSession && !activeSession.complete && isConnected
  const displayMessages = isLive ? messages : activeSession?.messages ?? []

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <SessionSidebar
        profile={clientProfile}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        onEditProfile={() => setShowProfileModal(true)}
      />

      <div className="flex flex-col flex-1 min-w-0">
        {activeSession ? (
          <ChatArea
            profile={activeSession.profile}
            messages={displayMessages}
            isThinking={isLive ? isThinking : false}
            isComplete={activeSession.complete || isComplete}
            isConnected={isConnected}
            onNewSession={handleNewSession}
          />
        ) : (
          <EmptyState
            hasProfile={!!clientProfile}
            onNewSession={handleNewSession}
            onSetUpProfile={() => setShowProfileModal(true)}
          />
        )}
      </div>

      {showProfileModal && (
        <NewSessionModal
          initial={clientProfile}
          onSave={handleSaveProfile}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  )
}
