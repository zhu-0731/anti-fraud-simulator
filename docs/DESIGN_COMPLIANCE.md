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
| 八个核心技能 | 基础完成 | 已由 `TacticRegistry` 统一管理 |
| 技能风险信号和防御方法 | 基础完成 | 每个 `TacticCard` 均含 `observableSignals` 和 `defenderCounters` |
| 技能成本和冷却 | 基础完成 | 已有 `validateTacticSelection()` 和单元测试 |
| 角色卡 | 基础完成 | 已新增 `RoleRegistry` |
| 渠道卡 | 基础完成 | 已新增 `ChannelRegistry` |
| 旧事件兼容元数据 | 基础完成 | `EventCard` 支持可选元数据，现有事件导出时自动补全 |
| TacticUse 运行时记录 | 基础完成 | 聊天回合和旧事件卡行动均会记录 `TacticUse` |
| DefenderStateReducer | 基础完成 | 已新增确定性 reducer，所有数值通过 `clamp` |
| DefenderRuleEngine | 基础完成 | 已新增规则型回合更新，不依赖 LLM |
| RuleNarrativeDirector | 基础完成 | 已包装现有 `NarrativeDirector` 作为规则回退 |
| DefenderGameService | 基础完成 | `/api/chat/send` 和 `/api/chat/open-contact` 已迁移到防守应用服务 |
| DefenseRule 可复用接口 | 基础完成 | 已新增独立 `DefenseRule` 接口 |
| AI 关闭可运行 | 基础完成 | `AI_ENABLED=false` 下 E2E 通过 |
| 正式 AI Gateway | 基础完成 | 已新增 `AIGateway`，`/api/ai/generate-event` 已切换 |
| 统一 AIProvider 接口 | 基础完成 | 已新增正式 `AIProvider` |
| Structured Output | 基础完成 | `EventCardSchema` 使用 Zod 校验结构化输出 |
| Schema 校验 | 基础完成 | 严格拒绝缺字段、越界、未知枚举和额外字段 |
| 超时 | 基础完成 | Gateway 使用 `AbortController` 和 `AI_TIMEOUT_MS` |
| 有限重试 | 基础完成 | 可重试错误最多重试 `AI_MAX_RETRIES`，默认 1 |
| 错误码归一化 | 基础完成 | 已新增 `AIErrorCode` / `AIError` |
| 安全输入检查 | 基础完成 | `SafetyPipeline.validateInput()` 阻断 prompt injection 类输入 |
| 安全输出检查 | 基础完成 | 输出真实 URL/支付替换警告会触发 `OUTPUT_BLOCKED` 回退 |
| AI 调用日志 | 基础完成 | 已新增内存 `AICallLogRepository` |
| live AI 验收 | 未完成 | 未调用真实 vivo/OpenAI 模型 |
| DirectorAgent 契约 | 基础完成 | 已新增 `DirectorInput` / `DirectorPlan` / `IDirectorAgent` |
| Director 不生成聊天文本 | 基础完成 | `RuleDirectorAgent` 只输出计划字段 |
| Director 技能授权 | 基础完成 | 使用 `TacticRegistry.validateTacticSelection()` |
| Director 冷却与强度 | 基础完成 | 已有单元测试覆盖冷却和难度强度 |
| Director 规则回退 | 基础完成 | `DirectorAgent` 失败时回退 `RuleDirectorAgent` |
| RiskActorAgent 契约 | 基础完成 | 已新增 `RiskActorInput` / `RiskActorOutput` / `IRiskActorAgent` |
| 风险角色授权技能 | 基础完成 | `RiskActorAgent` 只使用 DirectorPlan 中允许且角色/渠道支持的技能 |
| 八种技能可运行路径 | 基础完成 | 单元测试覆盖八个技能模板路径 |
| 风险角色模拟域名 | 基础完成 | 测试确认不输出真实 URL |
| SupportAgent 契约 | 基础完成 | 已新增 `SupportAgentInput` / `SupportAgentOutput` / `ISupportAgent` |
| 支持角色覆盖 | 基础完成 | 家人、同伴、群聊、辅导员、官方、反诈均有规则实现 |
| 权威支持角色边界 | 基础完成 | 辅导员/官方/反诈不输出风险操作 |
| 支持角色模拟域名 | 基础完成 | 官方引导只使用模拟域名 |
| 防守模式入口 | 基础完成 | StartScreen 支持模式展示、难度选择和任务背景 |
| 正式模式隐藏内部状态 | 基础完成 | 普通页面不显示调试面板、风险真值、技能标签或 DirectorPlan |
| 调试模式 | 基础完成 | `?debug=1` 可显示 WorldState、DefenderState、TacticUse 摘要 |
| 安全路径完整完成 | 基础完成 | 官网“完成核实并查看复盘”通过服务端官方核实路径进入报告 |
| 风险路径完整完成 | 基础完成 | 信息泄露后进入应急页，可查看复盘报告 |
| 电话通话结果稳定显示 | 基础完成 | 电话后台核实不再自动跳转报告页 |
| 信息递进跨轮累计 | 基础完成 | `NarrativeDirector` 合并并累计 intent/contact 数值增量 |
