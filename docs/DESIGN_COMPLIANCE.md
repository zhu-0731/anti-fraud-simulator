# DESIGN_COMPLIANCE

| 需求 | 当前状态 | 结论 |
|---|---|---|
| LLM 不直接修改 GameState | 部分符合 | 需要测试验证 |
| Structured Output | 未完成 | Provider 仅要求返回 JSON |
| Schema 校验 | 未完成 | 使用 `as EventCard` |
| 超时 | 未完成 | 没有 `AbortController` |
| 有限重试 | 未完成 | 没有重试策略 |
| 安全输入检查 | 未完成 | 尚未建立统一安全输入管线 |
| 安全输出检查 | 部分完成 | 存在 `SafetyFilterService` |
| 规则回退 | 部分完成 | Orchestrator 有 Mock 路径 |
| 自动化单元测试 | 基础完成 | 已接入 Vitest，覆盖 `clamp` 和 `SafetyFilterService` |
| 自动化集成测试 | 基础完成 | 已覆盖 `GameEngine.startSession` |
| 自动化 E2E | 基础完成 | 已接入 Playwright，覆盖桌面和 375px 移动冒烟路径 |
| 浏览器日志抓取 | 基础完成 | 已有 `tests/e2e/fixtures/logged-test.ts` |
| 结构化服务端日志 | 未完成 | 无统一 logger |
| `OpenAICompatibleEventProvider` 定位 | 部分符合 | 仅作为历史遗留实验原型，不是正式 AI Gateway |
| GameMode | 基础完成 | 已新增 `defender` / `red_team` 类型 |
| GameDifficulty | 基础完成 | 已新增 `beginner` / `standard` / `advanced` 类型 |
| 统一启动 API | 基础完成 | 已新增 `POST /api/game/start`，旧 `/api/session/start` 保持兼容 |
| 防守/红队状态隔离 | 基础完成 | 防守仓储写入时校验不得包含 `redTeamState`，红队只返回未启用契约 |
| 红队模式完整玩法 | 未完成 | 本阶段明确不实现，仅保留 `FEATURE_NOT_READY` 合同 |
