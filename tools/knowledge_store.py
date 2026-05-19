import uuid
import chromadb

_collection = None


def _get_collection() -> chromadb.Collection:
    global _collection
    if _collection is None:
        client = chromadb.PersistentClient(path="./data/chroma")
        _collection = client.get_or_create_collection(name="investment_knowledge")
    return _collection


def query_knowledge_store(query: str) -> str:
    """Query the investment knowledge store for previously researched information.
    Always call this before web_search to avoid redundant lookups.

    Args:
        query: Natural language query to search the knowledge store.

    Returns:
        Relevant stored research, or a message indicating nothing was found.
    """
    collection = _get_collection()
    count = collection.count()
    if count == 0:
        return "Knowledge store is empty. Use web_search to gather information."

    results = collection.query(
        query_texts=[query],
        n_results=min(3, count),
    )
    docs = results["documents"][0]
    metas = results["metadatas"][0]

    if not docs:
        return "No relevant information found in knowledge store."

    return "\n\n".join(
        f"[Source: {m.get('source', 'unknown')}]\n{doc}"
        for doc, m in zip(docs, metas)
    )


def add_to_knowledge_store(content: str, source: str) -> str:
    """Save research findings to the knowledge store for future retrieval.
    Call this after every web_search to persist useful findings.

    Args:
        content: The research content to store.
        source: A label describing where this came from (e.g. URL or topic).

    Returns:
        Confirmation message with the assigned document ID.
    """
    collection = _get_collection()
    doc_id = str(uuid.uuid4())
    collection.add(
        documents=[content],
        ids=[doc_id],
        metadatas=[{"source": source}],
    )
    return f"Stored in knowledge base (id: {doc_id})"
