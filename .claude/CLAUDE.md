# Asset Agents — Project Instructions

## What this project is
A multi-agent investment advisory system built for a take-home assignment.
Three agents collaborate: Client (simulated), Advisor (orchestrator), Analyst (researcher).
Delivered as a FastAPI WebSocket API first, then a streaming UI.

## Tech stack
- **Orchestration:** Google ADK (Agent Development Kit)
- **LLM:** Anthropic Claude via `anthropic` Python SDK (not LiteLLM, not LangChain)
- **API layer:** FastAPI with WebSockets (async throughout)
- **Knowledge store:** ChromaDB (vector store, local)
- **Internet access:** Analyst uses web search tool (Tavily or DuckDuckGo)
- **Python:** 3.11+, `uv` for dependency management

## Agent architecture — hard constraints
```
Client Agent
    ↕  (only this channel)
Advisor Agent
    ↕  (only this channel)
Analyst Agent  →  [internet]  →  [knowledge store]
```
- Advisor is the ONLY agent that talks to Client
- Analyst NEVER talks to Client directly
- Conversation ends explicitly when Advisor signals completion

## Project structure (target)
```
asset-agents/
├── agents/
│   ├── client_agent.py
│   ├── advisor_agent.py
│   └── analyst_agent.py
├── tools/
│   ├── web_search.py
│   └── knowledge_store.py
├── api/
│   └── main.py          # FastAPI + WebSocket entry point
├── data/
│   └── chroma/          # ChromaDB persistence
├── tests/
├── pyproject.toml
└── .env.example
```

## Code rules for this project
- All agent communication is async — no sync calls inside async functions
- Environment variables for ALL secrets — never hardcode API keys
- No mock/stub data in the main code path — if a tool fails, raise, don't fake
- WebSocket messages are JSON: `{"type": "...", "agent": "...", "content": "..."}`
- ADK agents are classes, not functions — follow ADK patterns consistently
- Tests go in `tests/` and use `pytest-asyncio`

## What NOT to do
- Do not use `langchain`, `llama_index`, or `openai` SDK
- Do not mix sync and async in the same call chain
- Do not add retry logic unless the assignment explicitly needs it
- Do not create `utils.py` catch-all files
