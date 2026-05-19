Spawn the assignment-validator agent to audit the current codebase against the take-home assignment criteria.

The agent should:
1. Map the full file structure using Glob
2. Read every agent, tool, and API file
3. Check all structural and technical requirements from the assignment brief
4. Return a markdown checklist with PASS / FAIL / PARTIAL for each requirement
5. End with a clear READY or NOT READY verdict and a list of any blocking gaps

Report results back here when done.
