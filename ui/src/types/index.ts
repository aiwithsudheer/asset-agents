export type RiskTolerance = 'conservative' | 'moderate' | 'aggressive'

export interface Asset {
  retirement_401k: number
  brokerage: number
  cash: number
}

export interface Holding {
  symbol: string
  shares: number
  avg_cost: number
}

export interface ClientProfile {
  name: string
  age: number
  risk_tolerance: RiskTolerance
  annual_income: number
  assets: Asset
  current_holdings: Holding[]
  goal: string
  concerns: string[]
}

export interface WSMessage {
  type: 'message' | 'delta' | 'status' | 'end' | 'error'
  agent: 'client' | 'advisor' | 'analyst' | 'system'
  content: string
  tool?: string
}

export interface ResearchStep {
  id: string
  content: string
  done: boolean
}

export type UIMessageKind = 'client' | 'advisor' | 'research' | 'end' | 'error'

export interface UIMessage {
  id: string
  kind: UIMessageKind
  content?: string
  researchSteps?: ResearchStep[]
  researchComplete?: boolean
  timestamp: string
  streaming?: boolean
}

export interface StoredSession {
  session_id: string
  profile: ClientProfile
  messages: UIMessage[]
  startedAt: string
  complete: boolean
}
