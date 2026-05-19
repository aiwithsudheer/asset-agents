import { useState, useCallback, useRef } from 'react'
import type { ClientProfile, UIMessage, WSMessage, ResearchStep } from '../types'

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8000'
const WS_BASE = API_BASE.replace(/^http/, 'ws')

function uid(): string {
  return crypto.randomUUID()
}

export interface AdvisorySessionState {
  messages: UIMessage[]
  isConnected: boolean
  isThinking: boolean
  isComplete: boolean
  error: string | null
  startSession: (profile: ClientProfile) => Promise<string>
  disconnect: () => void
}

export function useAdvisorySession(): AdvisorySessionState {
  const [messages, setMessages] = useState<UIMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const researchIdRef = useRef<string | null>(null)
  const streamingRef = useRef<{ id: string; agent: 'advisor' | 'client' } | null>(null)

  const closeResearchPanel = useCallback((setMsgs: typeof setMessages) => {
    if (!researchIdRef.current) return
    const rid = researchIdRef.current
    researchIdRef.current = null
    setMsgs(prev =>
      prev.map(m =>
        m.id === rid
          ? {
              ...m,
              researchComplete: true,
              researchSteps: m.researchSteps?.map(s => ({ ...s, done: true })),
            }
          : m,
      ),
    )
  }, [])

  const handleMessage = useCallback(
    (msg: WSMessage) => {
      // Streaming chunk — append to in-progress message bubble
      if (msg.type === 'delta' && (msg.agent === 'advisor' || msg.agent === 'client')) {
        const agent = msg.agent as 'advisor' | 'client'
        setIsThinking(false)
        if (!streamingRef.current || streamingRef.current.agent !== agent) {
          closeResearchPanel(setMessages)
          const id = uid()
          streamingRef.current = { id, agent }
          setMessages(prev => [
            ...prev,
            { id, kind: agent, content: msg.content, timestamp: new Date().toISOString(), streaming: true },
          ])
        } else {
          const { id } = streamingRef.current
          setMessages(prev =>
            prev.map(m => m.id === id ? { ...m, content: (m.content ?? '') + msg.content } : m),
          )
        }
        return
      }

      // Complete message — finalize streaming bubble or create new one
      if (msg.type === 'message' && (msg.agent === 'client' || msg.agent === 'advisor')) {
        const agent = msg.agent as 'advisor' | 'client'
        closeResearchPanel(setMessages)
        setIsThinking(false)
        if (streamingRef.current?.agent === agent) {
          const { id } = streamingRef.current
          streamingRef.current = null
          setMessages(prev =>
            prev.map(m => m.id === id ? { ...m, content: msg.content, streaming: false } : m),
          )
        } else {
          setMessages(prev => [
            ...prev,
            { id: uid(), kind: agent, content: msg.content, timestamp: new Date().toISOString() },
          ])
        }
        setIsThinking(true)
        return
      }

      if (msg.type === 'status') {
        setIsThinking(false)
        const isTopLevel = msg.tool === 'analyst'

        if (isTopLevel) {
          // Open the research panel; don't add "Consulting analyst" as a step
          if (!researchIdRef.current) {
            const researchId = uid()
            researchIdRef.current = researchId
            setMessages(prev => [
              ...prev,
              {
                id: researchId,
                kind: 'research',
                researchSteps: [],
                researchComplete: false,
                timestamp: new Date().toISOString(),
              },
            ])
          }
          // Second analyst call while panel already open → ignore
        } else {
          // Sub-tool step (web_search, query_knowledge_store, etc.)
          if (!researchIdRef.current) {
            // Fallback: panel not open yet, create it
            const researchId = uid()
            researchIdRef.current = researchId
            setMessages(prev => [
              ...prev,
              {
                id: researchId,
                kind: 'research',
                researchSteps: [{ id: uid(), content: msg.content, done: false }],
                researchComplete: false,
                timestamp: new Date().toISOString(),
              },
            ])
          } else {
            const rid = researchIdRef.current
            setMessages(prev =>
              prev.map(m => {
                if (m.id !== rid) return m
                const steps: ResearchStep[] = m.researchSteps ?? []
                return {
                  ...m,
                  researchSteps: [
                    ...steps.map((s, i) =>
                      i === steps.length - 1 ? { ...s, done: true } : s,
                    ),
                    { id: uid(), content: msg.content, done: false },
                  ],
                }
              }),
            )
          }
        }
        return
      }

      if (msg.type === 'research_query' && researchIdRef.current) {
        const rid = researchIdRef.current
        setMessages(prev =>
          prev.map(m => m.id === rid ? { ...m, advisorQuery: msg.content } : m),
        )
        return
      }

      if (msg.type === 'research_result' && researchIdRef.current) {
        const rid = researchIdRef.current
        setMessages(prev =>
          prev.map(m => m.id === rid ? { ...m, analystResponse: msg.content } : m),
        )
        return
      }

      if (msg.type === 'end') {
        closeResearchPanel(setMessages)
        setIsThinking(false)
        setIsComplete(true)
        setMessages(prev => [
          ...prev,
          { id: uid(), kind: 'end', content: msg.content, timestamp: new Date().toISOString() },
        ])
        return
      }

      if (msg.type === 'error') {
        setIsThinking(false)
        setError(msg.content)
        setMessages(prev => [
          ...prev,
          { id: uid(), kind: 'error', content: msg.content, timestamp: new Date().toISOString() },
        ])
      }
    },
    [closeResearchPanel],
  )

  const startSession = useCallback(
    async (profile: ClientProfile): Promise<string> => {
      // Reset all state
      setMessages([])
      setIsConnected(false)
      setIsThinking(false)
      setIsComplete(false)
      setError(null)
      researchIdRef.current = null
      streamingRef.current = null

      wsRef.current?.close()
      wsRef.current = null

      const res = await fetch(`${API_BASE}/session/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      })
      if (!res.ok) {
        const detail = await res.text()
        throw new Error(detail || `Server error ${res.status}`)
      }
      const { session_id } = (await res.json()) as { session_id: string }

      const ws = new WebSocket(`${WS_BASE}/ws/${session_id}`)
      wsRef.current = ws

      ws.onopen = () => {
        setIsConnected(true)
        setIsThinking(true)
      }
      ws.onmessage = event => {
        handleMessage(JSON.parse(event.data as string) as WSMessage)
      }
      ws.onclose = () => {
        setIsConnected(false)
        setIsThinking(false)
      }
      ws.onerror = () => {
        setError('Connection error. Is the server running on port 8000?')
        setIsThinking(false)
      }

      return session_id
    },
    [handleMessage],
  )

  const disconnect = useCallback(() => {
    wsRef.current?.close()
    wsRef.current = null
    setIsConnected(false)
    setIsThinking(false)
  }, [])

  return { messages, isConnected, isThinking, isComplete, error, startSession, disconnect }
}
