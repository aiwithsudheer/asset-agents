"""
End-to-end test script.
1. POSTs a client profile to /session/start
2. Connects to the WebSocket
3. Streams the full advisory conversation to the terminal

Usage:
    uv run python watch_session.py
"""
import asyncio
import json
import httpx
import websockets

BASE_URL = "http://localhost:8000"

PROFILE = {
    "name": "Sarah Kim",
    "age": 28,
    "risk_tolerance": "aggressive",
    "annual_income": 80000,
    "assets": {
        "retirement_401k": 15000,
        "brokerage": 10000,
        "cash": 20000,
    },
    "current_holdings": [
        {"symbol": "AAPL", "shares": 10, "avg_cost": 170.0},
    ],
    "goal": "grow wealth aggressively over 30 years",
    "concerns": ["missing out on growth", "inflation"],
}

AGENT_LABELS = {
    "client":  "CLIENT  ",
    "advisor": "ADVISOR ",
    "analyst": "ANALYST ",
    "system":  "SYSTEM  ",
}


def _print_msg(msg: dict) -> None:
    agent = msg.get("agent", "unknown")
    label = AGENT_LABELS.get(agent, agent.upper().ljust(8))
    kind = msg["type"]

    if kind == "message":
        print(f"\n[{label}] {msg['content']}")
    elif kind == "status":
        print(f"  [{label}] ... {msg['content']}")
    elif kind == "end":
        print(f"\n[{label}] {msg['content']}")
    elif kind == "error":
        print(f"\n[ERROR   ] {msg['content']}")


async def run() -> None:
    # Step 1: start session
    async with httpx.AsyncClient() as http:
        resp = await http.post(
            f"{BASE_URL}/session/start",
            json={"profile": PROFILE},
        )
        resp.raise_for_status()
        session_id = resp.json()["session_id"]

    print(f"Session started: {session_id}")
    print("-" * 60)

    # Step 2: stream conversation
    ws_url = f"ws://localhost:8000/ws/{session_id}"
    async with websockets.connect(ws_url) as ws:
        async for raw in ws:
            msg = json.loads(raw)
            _print_msg(msg)
            if msg["type"] in ("end", "error"):
                break

    print("-" * 60)
    print("Done.")


if __name__ == "__main__":
    asyncio.run(run())
