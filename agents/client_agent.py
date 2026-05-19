import os
import anthropic

MODEL = "claude-sonnet-4-6"


def build_initial_message(profile: dict) -> str:
    """Build the client's opening line from their profile."""
    name = profile["name"]
    goal = profile.get("goal", "plan for my financial future")
    return (
        f"Hi, I'm {name} and I'm looking for some investment advice. "
        f"I want to {goal.lower()}, but I'm not sure if I'm on the right track. "
        "Can you help me?"
    )


def _build_system_prompt(profile: dict) -> str:
    assets = profile.get("assets", {})
    holdings = profile.get("current_holdings", [])
    concerns = profile.get("concerns", [])

    holdings_str = "\n".join(
        f"    - {h['shares']} shares {h['symbol']} (avg cost ${h['avg_cost']:,.2f})"
        for h in holdings
    ) or "    - None"

    concerns_str = ", ".join(concerns) if concerns else "None specified"

    return f"""You are {profile['name']}, a {profile['age']}-year-old seeking investment advice.

Financial profile:
- Age: {profile['age']}
- Risk tolerance: {profile['risk_tolerance']}
- Annual income: ${profile.get('annual_income', 0):,.0f}
- Assets:
    - 401(k): ${assets.get('retirement_401k', 0):,.0f}
    - Brokerage: ${assets.get('brokerage', 0):,.0f}
    - Cash / emergency fund: ${assets.get('cash', 0):,.0f}
- Current holdings:
{holdings_str}
- Goal: {profile.get('goal', 'Not specified')}
- Concerns: {concerns_str}

Respond naturally as {profile['name']}. Be engaged but not overly technical.
Keep replies to 2-4 sentences unless more is genuinely needed.
Ask clarifying questions when appropriate.
When the advisor has delivered a complete recommendation and you are satisfied, say so clearly."""


async def generate_client_response(
    conversation_history: list[dict],
    profile: dict,
) -> str:
    """Generate the next client message driven by the supplied profile.

    Args:
        conversation_history: Alternating messages from the client's perspective.
            role="user"      → advisor speaking to the client
            role="assistant" → client's own prior responses
        profile: The client profile dict stored in the session.

    Returns:
        The client's next response as a plain string.
    """
    client = anthropic.AsyncAnthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    response = await client.messages.create(
        model=MODEL,
        max_tokens=512,
        system=_build_system_prompt(profile),
        messages=conversation_history,
    )
    return response.content[0].text
