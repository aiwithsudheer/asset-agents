import os
import uuid
from contextlib import asynccontextmanager
from typing import Literal

from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from google.adk.runners import Runner
from google.adk.sessions import DatabaseSessionService
from google.genai import types as genai_types
from pydantic import BaseModel, Field

from agents.advisor_agent import advisor_agent
from agents.client_agent import build_initial_message, generate_client_response

load_dotenv()

APP_NAME = "investment_advisor"
SESSION_DB_URL = "sqlite+aiosqlite:///./data/sessions.db"
MAX_TURNS = 12

os.makedirs("./data", exist_ok=True)
session_service = DatabaseSessionService(db_url=SESSION_DB_URL)

# In-memory profile store: session_id → profile dict.
# Populated by POST /session/start, consumed and cleaned up by the WebSocket handler.
_session_profiles: dict[str, dict] = {}


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class Asset(BaseModel):
    retirement_401k: float = Field(default=0.0, ge=0)
    brokerage: float = Field(default=0.0, ge=0)
    cash: float = Field(default=0.0, ge=0)


class Holding(BaseModel):
    symbol: str
    shares: float = Field(gt=0)
    avg_cost: float = Field(gt=0)


class ClientProfile(BaseModel):
    name: str
    age: int = Field(ge=18, le=100)
    risk_tolerance: Literal["conservative", "moderate", "aggressive"]
    annual_income: float = Field(ge=0)
    assets: Asset = Field(default_factory=Asset)
    current_holdings: list[Holding] = Field(default_factory=list)
    goal: str
    concerns: list[str] = Field(default_factory=list)


class SessionStartRequest(BaseModel):
    profile: ClientProfile


class SessionStartResponse(BaseModel):
    session_id: str


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _is_end_call(event) -> bool:
    if not event.content or not event.content.parts:
        return False
    for part in event.content.parts:
        if hasattr(part, "function_call") and part.function_call:
            if part.function_call.name == "end_conversation":
                return True
    return False


def _extract_text(event) -> str | None:
    if not event.content or not event.content.parts:
        return None
    for part in event.content.parts:
        if hasattr(part, "text") and part.text:
            return part.text
    return None


async def _emit(websocket: WebSocket, event) -> None:
    if not event.content or not event.content.parts:
        return
    for part in event.content.parts:
        if hasattr(part, "text") and part.text:
            await websocket.send_json({
                "type": "message",
                "agent": event.author,
                "content": part.text,
            })
        elif hasattr(part, "function_call") and part.function_call:
            name = part.function_call.name
            if name != "end_conversation":
                await websocket.send_json({
                    "type": "status",
                    "agent": event.author,
                    "content": f"Calling {name.replace('_', ' ')}…",
                })


async def _run_advisor_turn(
    runner: Runner,
    websocket: WebSocket,
    user_id: str,
    session_id: str,
    client_message: str,
) -> tuple[str, bool]:
    """Run one advisor turn and stream all events to the WebSocket.

    Returns:
        (advisor_text, ended) — ended is True when end_conversation was called.
    """
    advisor_text = ""
    ended = False

    async for event in runner.run_async(
        user_id=user_id,
        session_id=session_id,
        new_message=genai_types.Content(
            role="user",
            parts=[genai_types.Part(text=client_message)],
        ),
    ):
        await _emit(websocket, event)

        if _is_end_call(event):
            ended = True

        if event.is_final_response():
            text = _extract_text(event)
            if text:
                advisor_text = text

    return advisor_text, ended


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs("./data/chroma", exist_ok=True)
    yield


app = FastAPI(title="Multi-Agent Investment Advisory System", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/session/start", response_model=SessionStartResponse)
async def start_session(request: SessionStartRequest):
    """Create a new advisory session with the supplied client profile.
    Returns a session_id to connect to via WebSocket at /ws/{session_id}.
    """
    session_id = str(uuid.uuid4())
    user_id = f"user_{session_id}"

    await session_service.create_session(
        app_name=APP_NAME,
        user_id=user_id,
        session_id=session_id,
    )
    _session_profiles[session_id] = request.profile.model_dump()

    return SessionStartResponse(session_id=session_id)


@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()

    profile = _session_profiles.get(session_id)
    if not profile:
        await websocket.send_json({
            "type": "error",
            "agent": "system",
            "content": "Session not found. Call POST /session/start first.",
        })
        await websocket.close()
        return

    runner = Runner(
        agent=advisor_agent,
        app_name=APP_NAME,
        session_service=session_service,
    )
    user_id = f"user_{session_id}"

    # client_history is from the client's perspective:
    #   role="user"      → advisor message addressed to the client
    #   role="assistant" → client's own response
    client_history: list[dict] = []
    current_client_msg = build_initial_message(profile)

    try:
        await websocket.send_json({
            "type": "message",
            "agent": "client",
            "content": current_client_msg,
        })

        for _ in range(MAX_TURNS):
            advisor_text, ended = await _run_advisor_turn(
                runner, websocket, user_id, session_id, current_client_msg
            )

            if advisor_text:
                client_history.append({"role": "user", "content": advisor_text})

            if ended:
                break

            current_client_msg = await generate_client_response(client_history, profile)
            client_history.append({"role": "assistant", "content": current_client_msg})

            await websocket.send_json({
                "type": "message",
                "agent": "client",
                "content": current_client_msg,
            })

        await websocket.send_json({
            "type": "end",
            "agent": "system",
            "content": "Advisory session complete.",
        })

    except WebSocketDisconnect:
        pass

    finally:
        _session_profiles.pop(session_id, None)
