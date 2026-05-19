"""Tests for individual agent components."""
import pytest
from dotenv import load_dotenv


load_dotenv()

SAMPLE_PROFILE = {
    "name": "Jordan Lee",
    "age": 40,
    "risk_tolerance": "moderate",
    "annual_income": 110000,
    "assets": {"retirement_401k": 90000, "brokerage": 25000, "cash": 40000},
    "current_holdings": [
        {"symbol": "VTI", "shares": 30, "avg_cost": 200.0},
        {"symbol": "BND", "shares": 20, "avg_cost": 80.0},
    ],
    "goal": "retire comfortably in 20 years",
    "concerns": ["inflation", "sequence of returns risk"],
}


# ---------------------------------------------------------------------------
# Client agent
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_client_responds_to_advisor_greeting():
    from agents.client_agent import generate_client_response

    history = [
        {
            "role": "user",
            "content": (
                "Hello Jordan! I'm your financial advisor today. "
                "Could you tell me what you're hoping to achieve?"
            ),
        }
    ]
    response = await generate_client_response(history, SAMPLE_PROFILE)
    assert isinstance(response, str)
    assert len(response) > 20


@pytest.mark.asyncio
async def test_client_reflects_provided_profile():
    from agents.client_agent import generate_client_response

    history = [
        {"role": "user", "content": "What is your biggest financial concern right now?"}
    ]
    response = await generate_client_response(history, SAMPLE_PROFILE)
    keywords = ["inflation", "retire", "portfolio", "concern", "savings", "growth", "risk"]
    assert any(kw in response.lower() for kw in keywords)


def test_build_initial_message_uses_profile_name():
    from agents.client_agent import build_initial_message

    msg = build_initial_message(SAMPLE_PROFILE)
    assert "Jordan Lee" in msg
    assert len(msg) > 20


# ---------------------------------------------------------------------------
# Knowledge store
# ---------------------------------------------------------------------------

def test_knowledge_store_empty_query():
    import chromadb
    import tools.knowledge_store as ks
    from tools.knowledge_store import query_knowledge_store

    tmp_client = chromadb.EphemeralClient()
    ks._collection = tmp_client.get_or_create_collection("test_empty")

    result = query_knowledge_store("ETF strategies")
    assert "empty" in result.lower() or "no relevant" in result.lower()

    ks._collection = None


def test_knowledge_store_roundtrip():
    import chromadb
    import tools.knowledge_store as ks
    from tools.knowledge_store import add_to_knowledge_store, query_knowledge_store

    tmp_client = chromadb.EphemeralClient()
    ks._collection = tmp_client.get_or_create_collection("test_roundtrip")

    add_to_knowledge_store(
        "Index funds like VTI provide broad market exposure with low expense ratios.",
        source="test",
    )
    result = query_knowledge_store("index fund expense ratio")
    assert "VTI" in result or "index" in result.lower()

    ks._collection = None
