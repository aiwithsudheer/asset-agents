Spawn the code-summarizer agent to generate documentation and interview prep material from the current codebase.

The agent should produce:
1. Architecture overview (README-ready): what the system does, agent roles table, ASCII communication flow diagram, tech stack with rationale
2. Agent interaction walkthrough: a concrete example showing message flow from Client question through Advisor→Analyst→tools→Advisor→Client, including the end condition
3. Key design decisions formatted as Decision / Why / Trade-off for: ADK choice, Anthropic SDK choice, knowledge store choice, WebSocket API choice, Analyst→Client constraint enforcement
4. Pythonic practices: concrete code examples of async patterns, agent boundaries, tool abstraction

Output clean markdown suitable for pasting directly into README sections.

Report results back here when done.
