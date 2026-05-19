# Investment Advisory UI

React streaming frontend for the Multi-Agent Investment Advisory System. Connects to the FastAPI WebSocket backend and renders the real-time three-agent conversation as a polished chat interface.

---

## What it does

- Stores a **client profile** once (persisted in `localStorage`) and reuses it across unlimited advisory sessions
- Opens a **WebSocket connection** to the backend and streams the advisor/client conversation word-by-word
- Shows a live **Analyst Research panel** when the advisor consults the analyst, with collapsible sub-steps, cycling status messages, and the full advisor-analyst exchange on demand
- Renders **markdown** from agent responses: bold, italic, headings, bullet lists, numbered lists, and tables
- Keeps a **session history** in `localStorage` so past sessions are browsable after the page reloads

---

## Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS v3 |
| Icons | Lucide React |
| State | React `useState` / `useRef` (no external store) |
| Persistence | `localStorage` |

---

## Project Structure

```
ui/
├── src/
│   ├── App.tsx                         # Root: profile state, session list, modal wiring
│   ├── types/index.ts                  # Shared types: ClientProfile, UIMessage, WSMessage, etc.
│   ├── hooks/
│   │   └── useAdvisorySession.ts       # WebSocket lifecycle, delta streaming, research panel state
│   └── components/
│       ├── SessionSidebar.tsx          # Left sidebar: profile card, session list, new session button
│       ├── ChatArea.tsx                # Main chat pane: message list + thinking indicator
│       ├── EmptyState.tsx              # Shown when no session is active
│       ├── NewSessionModal.tsx         # Create / edit client profile form
│       ├── MarkdownText.tsx            # Inline markdown renderer (bold, italic, lists, tables)
│       └── messages/
│           ├── AdvisorMessage.tsx      # Blue-accented advisor bubble with streaming cursor
│           ├── ClientMessage.tsx       # Grey client bubble with streaming cursor
│           ├── ResearchPanel.tsx       # Amber analyst panel with cycling status + expandable exchange
│           ├── ThinkingIndicator.tsx   # Bouncing dots while the next party generates
│           └── SessionEndBanner.tsx    # End-of-session banner with "New Session" CTA
├── index.html
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

---

## Setup

### Prerequisites

- Node.js 18+
- The [FastAPI backend](../README.md) running on `http://localhost:8000`

### Install and run

```bash
cd ui
npm install
npm run dev
```

The app starts at `http://localhost:5173`.

### Point to a different backend

Create `ui/.env.local`:

```
VITE_API_URL=http://localhost:8000
```

If this variable is not set, the app defaults to `http://localhost:8000`.

---

## How it works

### Profile vs. Sessions

The client profile (name, age, risk tolerance, holdings, goal) is **set once** and stored in `localStorage` under the key `advisory_profile`. It is reused for every new session. You can edit it at any time from the sidebar or the empty state screen without starting a new session.

Sessions are stored under `advisory_sessions` and contain the full message history. Selecting a past session from the sidebar replays the stored messages without reconnecting.

### WebSocket message types

The hook (`useAdvisorySession`) handles these event types from the server:

| `type` | Action |
|---|---|
| `delta` | Append chunk to the current streaming message bubble |
| `message` | Finalise the streaming bubble with the authoritative complete text |
| `status` | Open the research panel (`tool: "analyst"`) or add a sub-step (`tool: "web_search"` etc.) |
| `research_query` | Store what the advisor asked the analyst (shown in the expanded panel) |
| `research_result` | Store the analyst's full response (shown in the expanded panel) |
| `end` | Mark session complete, close connection |
| `error` | Show inline error bubble |

### Streaming

Every word arrives as a `delta` event. The hook accumulates deltas into a single message bubble marked `streaming: true`. A blinking cursor appears while the bubble is live. The final `message` event replaces the content with the authoritative text (preserving original whitespace and newlines) and removes the cursor.

### Research Panel

When the advisor calls the analyst, the sequence is:

1. Advisor streams a brief hold message to the client ("Give me a moment…")
2. `status` event with `tool: "analyst"` opens the amber panel
3. `research_query` event stores the advisor's question
4. `status` events with `tool: "web_search"` / `tool: "query_knowledge_store"` etc. appear as steps inside the panel
5. `research_result` stores the analyst's full response
6. When the advisor sends its next message, the panel closes and collapses to a one-liner

Clicking the `>` chevron on a completed panel expands a card showing: what the advisor asked, the steps taken, and what the analyst responded.

---

## Build for production

```bash
npm run build
```

Output goes to `ui/dist/`. Serve it with any static file host. Make sure the backend's `allow_origins` CORS setting includes your production domain.
