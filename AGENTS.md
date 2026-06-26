<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project development protocol

Before modifying code, read these files in order:

1. `docs/智能体设计.md`
2. `docs/项目一阶段执行文档.md`
3. `docs/DESIGN_COMPLIANCE.md`
4. `docs/DEVELOPMENT_LOG.md`
5. Relevant documents under `node_modules/next/dist/docs/`

Mandatory rules:

- Never work directly on `master`.
- Create a new branch for each small feature.
- Complete execution stages in the order defined by `docs/项目一阶段执行文档.md`.
- Do not start formal AI refactoring until stage 1 testing and observability pass.
- Existing `OpenAICompatibleEventProvider` is an experimental prototype, not the formal AI Gateway.
- Every functional change requires unit or integration tests.
- User-visible workflows require Playwright E2E coverage.
- Run lint, tests, build, and relevant E2E tests before marking a task complete.
- Do not push, merge to master, rewrite history, or force-push without explicit user authorization.
- Never expose or commit API keys or real personal data.
- Never cast unvalidated model output directly to domain types.
