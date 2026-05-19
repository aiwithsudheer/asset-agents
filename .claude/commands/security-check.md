Spawn the security-reviewer agent to audit the current codebase for security vulnerabilities.

The agent should:
1. Glob all Python files, config files, and any .env.example
2. Check for credential exposure, WebSocket security gaps, injection vectors, information leakage, and insecure configuration
3. Group findings by severity: CRITICAL, HIGH, MEDIUM, LOW, INFO
4. Cite file:line for every finding
5. Return a concrete fix recommendation for each finding
6. End with SECURE or NEEDS FIXES verdict

If $ARGUMENTS is provided, scope the review to those files or directories only.
Otherwise review the entire project.

Report results back here when done.
