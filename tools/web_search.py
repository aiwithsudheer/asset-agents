import os
from tavily import AsyncTavilyClient


async def web_search(query: str) -> str:
    """Search the web for current financial information, market data, and investment news.

    Args:
        query: The search query string.

    Returns:
        A summary of the top search results.
    """
    client = AsyncTavilyClient(api_key=os.environ["TAVILY_API_KEY"])
    response = await client.search(
        query=query,
        search_depth="basic",
        max_results=3,
        include_answer=True,
    )

    if response.get("answer"):
        answer = response["answer"]
        sources = [r["url"] for r in response.get("results", [])[:3]]
        source_list = "\n".join(f"- {s}" for s in sources)
        return f"{answer}\n\nSources:\n{source_list}"

    results = response.get("results", [])
    if not results:
        return "No results found for the given query."

    return "\n\n".join(
        f"[{r['url']}]\n{r['content'][:400]}"
        for r in results[:3]
    )
