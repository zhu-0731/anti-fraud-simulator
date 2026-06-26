# DEVELOPMENT_LOG

## 基线审计

- 读取时间：2026-06-27
- 设计文档路径：`docs/智能体设计.md`
- 设计文档哈希：`9f0d91a8f95060c5f1f892119b46b9a91330332b`
- 本阶段对应章节：`docs/项目一阶段执行文档.md` 阶段 0：基线冻结与差距分析
- 本阶段不实现的章节：阶段 1-10、完整 AI Gateway、DirectorAgent、RiskActorAgent、SupportAgent、红队模式、持久化和持续进化

### 设计摘要

- 本阶段目标：冻结现状、记录差距、建立后续阶段的审计基础。
- 涉及的数据结构：现有 `GameState`、`EventCard`、`WorldState`、`AIEventOutput`；正式 `DefenderState`、`TacticCard`、`EpisodeTurn` 等尚未实现。
- 必须保持的安全边界：真实密钥只放本地环境变量；模型输出不得直接覆盖 `GameState`；普通玩家界面不展示隐藏风险真值。
- 必须提供的回退：当前正式可依赖路径为规则和 Mock 路径；实验性 provider 不作为正式 AI Gateway。
- 明确禁止实现的内容：阶段 1 未完成前不继续 AI 重构，不实现完整红队玩法，不自动进化策略。

### 当前状态

- 项目已经存在 `OpenAICompatibleEventProvider` 实验原型。
- 测试基础设施：尚未建立。
- Vitest：未安装。
- Playwright：未安装。
- AI Gateway：未实现。
- 当前正式可依赖路径：规则和 Mock 路径。
- 决策：冻结实验 Provider 扩展，先执行阶段 0 和阶段 1。

### 验证记录

| 命令 | 结果 | 备注 |
|---|---|---|
| `npm run lint` | PASS | 2026-06-27 执行通过 |
| `npm run build` | PASS | 2026-06-27 执行通过 |
| `npm run test` | NOT RUN | 脚本尚未建立 |
| `npm run test:e2e` | NOT RUN | Playwright 尚未建立 |

## 阶段 1：自动化测试与可观测性

- 读取时间：2026-06-27
- 分支：`chore/test-harness`
- 设计文档路径：`docs/智能体设计.md`
- 设计文档哈希：`9f0d91a8f95060c5f1f892119b46b9a91330332b`
- 本阶段对应章节：`docs/项目一阶段执行文档.md` 阶段 1：自动化测试与可观测性
- 本阶段不实现的章节：正式 AI Gateway、DirectorAgent、RiskActorAgent、SupportAgent、红队模式、持久化和持续进化

### 完成内容

- 安装并配置 Vitest、Testing Library、jsdom 和 coverage provider。
- 安装并配置 Playwright Chromium。
- 新增基础单元测试：`clamp`、`SafetyFilterService`。
- 新增基础集成测试：`GameEngine.startSession` 创建可玩会话。
- 新增基础 E2E 冒烟测试：开始模拟、联系人列表、风险联系人聊天、官网、电话、证据页。
- 新增 Playwright 日志 fixture，采集 console、pageerror、requestfailed 和 `/api/*` 4xx/5xx。
- `test:e2e` 使用生产 build + `next start`，避免 dev HMR WebSocket 噪音。

### 验证记录

| 命令 | 结果 | 备注 |
|---|---|---|
| `npm run lint` | PASS | 2026-06-27 执行通过 |
| `npm run test` | PASS | 3 files, 4 tests |
| `npm run build` | PASS | Next.js 16.2.6 production build |
| `npm run test:e2e` | PASS | desktop-chromium 和 mobile-375 共 2 tests |
| `npm run verify` | PASS | lint + test + build + e2e 全部通过 |

### 测试证据

- Playwright HTML report：`playwright-report/`
- Playwright raw results：`test-results/`
- Browser console log：由 `tests/e2e/fixtures/logged-test.ts` 附加到每个测试报告
- Network log：由 `tests/e2e/fixtures/logged-test.ts` 附加到每个测试报告

### 未完成

- 尚未建立服务端结构化 logger。
- 尚未建立完整 artifacts/test-runs 归档脚本。
- E2E 当前只覆盖基础冒烟路径，安全通关、风险泄露、AI 关闭、AI 超时、非法 AI 输出等场景仍待补充。

## 阶段 2：双模式领域骨架

- 读取时间：2026-06-27
- 分支：`refactor/game-mode-types`
- 设计文档路径：`docs/智能体设计.md`
- 设计文档哈希：`9f0d91a8f95060c5f1f892119b46b9a91330332b`
- 本阶段对应章节：`docs/项目一阶段执行文档.md` 阶段 2：双模式领域骨架；`docs/智能体设计.md` 第 4、11、16、36、37、38 节
- 本阶段不实现的章节：完整红队玩法、AI Gateway、DirectorAgent、RiskActorAgent、SupportAgent、持久化和持续进化

### 设计摘要

- 本阶段目标：建立 `defender` / `red_team` 模式和难度的统一领域骨架，新增统一启动接口，同时保持现有防守规则流程不回归。
- 涉及的数据结构：`GameMode`、`GameDifficulty`、`DefenderState`、`RedTeamState`、`FeatureNotReadyResponse`。
- 必须保持的安全边界：红队模式只提供未启用契约，不实现完整攻击玩法；防守状态不得包含红队状态；普通玩家界面不展示隐藏风险真值。
- 必须提供的回退：旧 `/api/session/start` 继续可用；前端默认通过 `/api/game/start` 启动 `defender` 规则路径。
- 明确禁止实现的内容：不接入正式 AI Gateway，不实现红队对局，不自动进化策略，不改变现有规则剧情。

### 完成内容

- 新增 `GameMode = 'defender' | 'red_team'` 和 `GameDifficulty = 'beginner' | 'standard' | 'advanced'`。
- 为防守会话加入 `mode`、`difficulty` 和正式 `defenderState` 骨架。
- 新增红队空状态初始化器和 `FEATURE_NOT_READY` 响应契约。
- 新增运行时状态校验，防守会话写入仓储前拒绝混入 `redTeamState`。
- 新增统一启动服务 `GameStartService` 和 `POST /api/game/start`。
- 旧 `/api/session/start` 保持兼容，并支持难度归一化。
- 前端 `apiClient.startSession()` 改为调用统一启动接口，默认仍启动防守模式。

### 验证记录

| 命令 | 结果 | 备注 |
|---|---|---|
| `npm run lint` | PASS | 2026-06-27 执行通过 |
| `npm run test` | PASS | 6 files, 12 tests |
| `npm run build` | PASS | Next.js 16.2.6 production build，`/api/game/start` 已注册 |
| `npm run test:e2e` | PASS | desktop-chromium 和 mobile-375 共 2 tests |
| `npm run verify` | PASS | lint + test + build + e2e 全部通过 |

### 测试证据

- Playwright HTML report：`playwright-report/`
- Playwright raw results：`test-results/`
- Browser console log：由 `tests/e2e/fixtures/logged-test.ts` 附加到每个测试报告
- Network log：由 `tests/e2e/fixtures/logged-test.ts` 附加到每个测试报告

### 未完成

- 红队模式仅返回未启用契约，完整玩法留到后续阶段。
- `DefenderState` 已建立骨架，但尚未替代现有 `WorldState` 和聊天规则运行时。
- 尚未建立结构化服务端 logger 和完整测试产物归档脚本。

## 阶段 3：技能、角色和渠道领域模型

- 读取时间：2026-06-27
- 分支：`feat/tactic-domain`
- 设计文档路径：`docs/智能体设计.md`
- 设计文档哈希：`9f0d91a8f95060c5f1f892119b46b9a91330332b`
- 本阶段对应章节：`docs/项目一阶段执行文档.md` 阶段 3：技能、角色和渠道领域模型；`docs/智能体设计.md` 第 5-10、17、27、38、41 节
- 本阶段不实现的章节：规则型防守运行时、正式 AI Gateway、DirectorAgent、RiskActorAgent、完整红队玩法、持久化和持续进化

### 设计摘要

- 本阶段目标：建立可复用的技能卡、角色卡、渠道卡和旧事件兼容元数据。
- 涉及的数据结构：`TacticType`、`TacticCard`、`TacticUse`、`RoleCard`、`ChannelCard`、`DefenseCapability`。
- 必须保持的安全边界：技能只表示游戏内抽象策略和防御能力，不生成现实可复用话术；旧事件卡字段继续保留。
- 必须提供的回退：现有 E01-E12 和 Mock 事件变体继续加载；兼容映射由代码从旧 `pressureTypes` / `safeActions` 生成。
- 明确禁止实现的内容：不让 AI 使用技能，不实现红队对局，不改变现有剧情运行顺序。

### 完成内容

- 新增八个核心技能：权威身份、同伴背书、时间压力、损失厌恶、核实拖延、渠道切换、信息递进、说辞修复。
- 新增 `TacticRegistry`，包含成本、冷却、最大强度、前置、互斥、风险信号、防御能力、允许角色和渠道。
- 新增 `RoleRegistry`，覆盖未认证工作人员、群聊成员、学长或学姐、家人转发者、模拟客服、自动通知。
- 新增 `ChannelRegistry`，覆盖群聊、私聊、短信、邮件、模拟电话、模拟网页。
- 新增技能选择校验：未知技能、每轮上限、重复技能、策略点不足、冷却、前置和互斥。
- 新增重复使用效果衰减，最低保留 0.4 倍效果。
- `EventCard` 新增可选兼容元数据：`source`、`tacticIds`、`testedCapabilities`、`difficulty`、`schemaVersion`。
- `chapter01Events` 和 `eventVariantsByGoal` 在导出处自动补兼容元数据，旧字段不删除。

### 验证记录

| 命令 | 结果 | 备注 |
|---|---|---|
| `npm run lint` | PASS | 2026-06-27 执行通过 |
| `npm run test` | PASS | 9 files, 23 tests |
| `npm run build` | PASS | Next.js 16.2.6 production build |
| `npm run test:e2e` | PASS | desktop-chromium 和 mobile-375 共 2 tests |

### 测试证据

- Playwright HTML report：`playwright-report/`
- Playwright raw results：`test-results/`
- Browser console log：由 `tests/e2e/fixtures/logged-test.ts` 附加到每个测试报告
- Network log：由 `tests/e2e/fixtures/logged-test.ts` 附加到每个测试报告

### 未完成

- 技能尚未接入规则型防守运行时和报告生成。
- `TacticUse` 已定义但尚未在玩家回合中记录。
- 未实现 AI Director 对技能的授权选择。

## 阶段 4：规则型防守运行时

- 读取时间：2026-06-27
- 分支：`feat/defender-rule-runtime`
- 设计文档路径：`docs/智能体设计.md`
- 设计文档哈希：`9f0d91a8f95060c5f1f892119b46b9a91330332b`
- 本阶段对应章节：`docs/项目一阶段执行文档.md` 阶段 4：规则型防守运行时；`docs/智能体设计.md` 第 11-15、31、38、40、41 节
- 本阶段不实现的章节：正式 AI Gateway、DirectorAgent、RiskActorAgent、SupportAgent、完整红队玩法、持久化和持续进化

### 设计摘要

- 本阶段目标：让防守模式拥有明确的规则型领域运行时，继续保留现有聊天和事件卡流程。
- 涉及的数据结构：`DefenderState`、`TacticUse`、`DefenseRule`、`DefenderRuleResult`。
- 必须保持的安全边界：Rule 模式不依赖 LLM；玩家行为后果由代码决定；普通界面不展示技能标签或隐藏状态。
- 必须提供的回退：`RuleNarrativeDirector` 包装现有 `NarrativeDirector`，作为后续 AI Director 的规则回退。
- 明确禁止实现的内容：不接入真实模型，不让 AI 直接修改状态，不实现红队完整玩法。

### 完成内容

- 新增 `DefenderStateReducer`，以确定性 reducer 更新并裁剪防守状态数值。
- 新增 `DefenderRuleEngine`，根据玩家意图、联系人和现有 `WorldState` 记录 `TacticUse`。
- 新增 `RuleNarrativeDirector`，保留现有规则叙事导演作为正式回退点。
- 新增 `DefenderScoringService`，组合旧评分与新防守状态指标。
- 新增独立 `DefenseRule` 接口，为后续红队准备度和策略复用预留。
- 新增 `DefenderGameService`，将 `/api/chat/send` 和 `/api/chat/open-contact` 从直接调用 `ChatService` 迁移到防守应用服务。
- 后台 narrative tick 会同步 `DefenderState`，避免新旧状态漂移。
- 旧事件卡行动也会根据兼容元数据记录 `TacticUse`，并更新 `DefenderState`。
- 修复聊天触发应急后 `EmergencyScreen` 仍使用旧事件的问题，确保展示 E11 应急动作。
- E2E 新增信息泄露进入应急路径，覆盖桌面和 375px 移动端。

### 验证记录

| 命令 | 结果 | 备注 |
|---|---|---|
| `npm run lint` | PASS | 2026-06-27 执行通过 |
| `npm run test` | PASS | 12 files, 29 tests |
| `npm run build` | PASS | Next.js 16.2.6 production build |
| `npm run test:e2e` | PASS | desktop-chromium 和 mobile-375 共 4 tests |
| `$env:AI_ENABLED='false'; $env:AI_PROVIDER='mock'; npm run test:e2e` | PASS | AI 关闭环境下 4 tests 通过 |

### 测试证据

- Playwright HTML report：`playwright-report/`
- Playwright raw results：`test-results/`
- Browser console log：由 `tests/e2e/fixtures/logged-test.ts` 附加到每个测试报告
- Network log：由 `tests/e2e/fixtures/logged-test.ts` 附加到每个测试报告

### 未完成

- 报告尚未完整消费 `TacticUse` 解释每轮技能和防御动作。
- 结构化服务端 logger 尚未建立。
- 完整安全通关到报告和风险路径到报告仍待阶段 8/9 扩展 E2E。

## 阶段 5：AI Gateway

- 读取时间：2026-06-27
- 分支：`feat/ai-gateway`
- 设计文档路径：`docs/智能体设计.md`
- 设计文档哈希：`9f0d91a8f95060c5f1f892119b46b9a91330332b`
- 本阶段对应章节：`docs/项目一阶段执行文档.md` 阶段 5：AI Gateway；`docs/智能体设计.md` 第 3、27、28、36、40、41 节
- 本阶段不实现的章节：DirectorAgent、RiskActorAgent、SupportAgent、完整红队玩法、持久化和持续进化

### 设计摘要

- 本阶段目标：建立 Provider 无关的正式 `AIGateway`，替代旧实验 Provider 作为正式入口。
- 涉及的数据结构：`AIProvider`、`AIErrorCode`、`AICallLog`、`EventCardSchema`、`GenerateEventGatewayResult`。
- 必须保持的安全边界：模型输出必须先经过 JSON 解析、Zod Schema 校验和安全输出检查；真实密钥只从环境变量读取。
- 必须提供的回退：AI 关闭、缺 key、超时、限流、服务错误、空输出、非法 JSON、Schema 不匹配、输入/输出安全失败均回退 Mock。
- 明确禁止实现的内容：不让模型直接覆盖 `GameState`，不读取 `api_key.txt`，不自动重试超过一次，不执行 live 模型验收。

### 完成内容

- 新增正式 `AIGateway`，支持 requestId、AbortController 超时、最多一次重试、错误码归一化和 Mock 回退。
- 新增正式 `AIProvider` 接口，以及 `MockAIProvider` 和 OpenAI/vivo 兼容 `OpenAIProvider`。
- 新增 `EventCardSchema`，使用 Zod 运行时校验模型输出，拒绝额外字段。
- 新增 `SafetyPipeline`，对输入做 prompt injection 检查，对输出做安全检查；真实 URL 或支付替换警告会触发 `OUTPUT_BLOCKED` 回退。
- 新增内存 `AICallLogRepository`，记录 requestId、sessionId、provider、model、latency、schemaValid、fallbackUsed、errorCode 和 retryCount。
- `/api/ai/generate-event` 已切换到正式 `AIGateway`。
- `.env.example` 增加空的 `VIVO_APP_ID` 和 `VIVO_APP_KEY`，不包含任何真实值。

### 验证记录

| 命令 | 结果 | 备注 |
|---|---|---|
| `npm run lint` | PASS | 2026-06-27 执行通过 |
| `npm run test` | PASS | 14 files, 38 tests |
| `npm run build` | PASS | Next.js 16.2.6 production build |
| `npm run test:e2e` | PASS | desktop-chromium 和 mobile-375 共 4 tests |
| live vivo/OpenAI call | NOT RUN | 未执行真实模型调用，避免使用真实 key 和产生费用 |

### 测试证据

- Playwright HTML report：`playwright-report/`
- Playwright raw results：`test-results/`
- Browser console log：由 `tests/e2e/fixtures/logged-test.ts` 附加到每个测试报告
- Network log：由 `tests/e2e/fixtures/logged-test.ts` 附加到每个测试报告

### 未完成

- 尚未将 DirectorAgent / RiskActorAgent / SupportAgent 接入 Gateway。
- AI 调用日志目前为内存仓储，持久化留到后续阶段。
- 未进行真实 vivo/OpenAI 模型验收。

## 阶段 6：DirectorAgent

- 读取时间：2026-06-27
- 分支：`feat/director-agent`
- 设计文档路径：`docs/智能体设计.md`
- 设计文档哈希：`9f0d91a8f95060c5f1f892119b46b9a91330332b`
- 本阶段对应章节：`docs/项目一阶段执行文档.md` 阶段 6：DirectorAgent；`docs/智能体设计.md` 第 2、12、13、38、40、41 节
- 本阶段不实现的章节：RiskActorAgent、SupportAgent、完整红队玩法、持久化和持续进化

### 设计摘要

- 本阶段目标：建立 DirectorAgent 计划契约，确保导演只决定阶段、角色、授权技能、强度和教学目标。
- 涉及的数据结构：`DirectorInput`、`DirectorPlan`、`DirectorResponseRole`、`IDirectorAgent`。
- 必须保持的安全边界：Director 不生成聊天文本，不直接修改 `GameState`，不绕过 `TacticRegistry` 授权技能。
- 必须提供的回退：主 Director 失败时使用 `RuleDirectorAgent` 并标记 `fallbackUsed=true`。
- 明确禁止实现的内容：不实现风险角色文本生成，不把完整剧本或裁判标准暴露给单一 Agent。

### 完成内容

- 新增 Director 类型契约，明确输入与输出。
- 新增 `RuleDirectorAgent`，根据防守状态、玩家意图、难度和历史技能使用生成规则计划。
- Director 输出包括响应角色、渠道、授权技能、最大强度、教学目标、阶段建议、视图效果和 reasonCode。
- Director 使用 `TacticRegistry.validateTacticSelection()` 约束每轮技能、策略点、冷却和前置条件。
- 新增 `DirectorAgent` 包装器，主 Agent 失败时回退规则 Director。

### 验证记录

| 命令 | 结果 | 备注 |
|---|---|---|
| `npm run lint` | PASS | 2026-06-27 执行通过 |
| `npm run test` | PASS | 15 files, 44 tests |
| `npm run build` | PASS | Next.js 16.2.6 production build |
| `npm run test:e2e` | PASS | desktop-chromium 和 mobile-375 共 4 tests |

### 测试证据

- Playwright HTML report：`playwright-report/`
- Playwright raw results：`test-results/`
- Browser console log：由 `tests/e2e/fixtures/logged-test.ts` 附加到每个测试报告
- Network log：由 `tests/e2e/fixtures/logged-test.ts` 附加到每个测试报告

### 未完成

- Director 计划尚未驱动 RiskActorAgent 生成文本。
- 尚未接入 AI Director；当前是规则 Director 和回退包装。

## 阶段 7a：RiskActorAgent

- 读取时间：2026-06-27
- 分支：`feat/risk-actor-agent`
- 设计文档路径：`docs/智能体设计.md`
- 设计文档哈希：`9f0d91a8f95060c5f1f892119b46b9a91330332b`
- 本阶段对应章节：`docs/项目一阶段执行文档.md` 阶段 7：RiskActorAgent；`docs/智能体设计.md` 第 2、6、10、12、27、28、40、41 节
- 本阶段不实现的章节：SupportAgent、正式防守交互整合、完整红队玩法、持久化和持续进化

### 完成内容

- 新增 `RiskActorInput` / `RiskActorOutput` / `IRiskActorAgent`。
- 新增模板化 `RiskActorAgent`，只根据 DirectorPlan 中授权的技能生成教育模拟文本。
- 八个核心技能均有受控模板路径。
- 未授权角色或官方角色不会使用风险技能。
- 生成内容只使用 `game-simulated-link.local` 模拟域名。

### 验证记录

| 命令 | 结果 | 备注 |
|---|---|---|
| `npm run test` | PASS | 16 files, 54 tests |
| `npm run build` | PASS | Next.js 16.2.6 production build |

### 未完成

- RiskActorAgent 尚未接入聊天 UI。
- 多轮核实拖延、渠道切换和信息递进的完整运行时路径留到后续交互阶段。

## 阶段 7b：SupportAgent

- 读取时间：2026-06-27
- 分支：`feat/support-agents`
- 设计文档路径：`docs/智能体设计.md`
- 设计文档哈希：`9f0d91a8f95060c5f1f892119b46b9a91330332b`
- 本阶段对应章节：`docs/项目一阶段执行文档.md` 阶段 7：SupportAgent；`docs/智能体设计.md` 第 2、11、12、27、28、40、41 节
- 本阶段不实现的章节：正式防守交互整合、完整红队玩法、持久化和持续进化

### 完成内容

- 新增 `SupportAgentInput` / `SupportAgentOutput` / `ISupportAgent`。
- 新增统一 `SupportAgent`，覆盖家人、同伴、群聊、辅导员、官方服务、反诈咨询。
- 家人和同伴可提供不完整但会建议核实的信息。
- 辅导员、官方和反诈角色标记为 authoritative，并只给安全/应急建议。
- 测试确认支持角色不输出真实 URL，官方引导只使用模拟域名。

### 验证记录

| 命令 | 结果 | 备注 |
|---|---|---|
| `npm run test` | PASS | 17 files, 63 tests |
| `npm run build` | PASS | Next.js 16.2.6 production build |

### 未完成

- SupportAgent 尚未替换现有聊天 UI AgentRegistry。
- SupportAgent 仍为规则模板实现，Gateway 接入留给后续阶段。

## 阶段 8：防守模式正式交互

- 读取时间：2026-06-27
- 分支：`feat/defender-interaction`
- 设计文档路径：`docs/智能体设计.md`
- 设计文档哈希：`9f0d91a8f95060c5f1f892119b46b9a91330332b`
- 本阶段对应章节：`docs/项目一阶段执行文档.md` 阶段 8；`docs/智能体设计.md` 第 2、12、27、28、40、41 节
- 本阶段不实现的章节：Episode 持久化、完整报告逐轮解释、数据库、红队完整玩法、策略进化

### 完成内容

- StartScreen 新增防守/红队模式入口、难度选择和任务背景；红队入口保持禁用，不暴露未完成玩法。
- 官网页新增“完成核实并查看复盘”正式收口动作，通过官方服务消息触发服务端状态更新和报告生成。
- 应急页“查看复盘报告”改为直接进入报告阶段，不再提交旧事件卡硬编码动作。
- `NarrativeDirector` 改为跨轮累计数值增量，同一回合的 intent/contact 增量会合并，满足信息递进要求。
- 电话核实只记录核实进度，不再因后台消息自动跳转报告页，避免通话结果闪现后跳页。
- 普通模式继续隐藏调试面板；`?debug=1` 调试面板补充 `DefenderState` 和 `TacticUse` 摘要。

### 验证记录

| 命令 | 结果 | 备注 |
|---|---|---|
| `npm run test -- tests/integration/defender-runtime.test.ts` | PASS | 覆盖聊天状态持久化、安全核实报告、旧事件技能记录 |
| `AI_ENABLED=false AI_PROVIDER=mock npm run test:e2e -- tests/e2e/defender-smoke.spec.ts` | PASS | desktop-chromium 和 mobile-375 共 6 tests |
| `AI_ENABLED=false AI_PROVIDER=mock npm run verify` | PASS | lint；17 files, 64 tests；Next.js build；desktop/mobile E2E 共 6 tests |

### 未完成

- 报告仍主要基于旧 `GameReport` 结构，逐轮 Episode 记录和 Agent 技能解释留到阶段 9。
- SupportAgent/RiskActorAgent 尚未替换现有 UI 聊天 AgentRegistry。

## 阶段 9：报告与 Episode 记录

- 读取时间：2026-06-27
- 分支：`feat/defender-reporting`
- 设计文档路径：`docs/智能体设计.md`
- 设计文档哈希：`9f0d91a8f95060c5f1f892119b46b9a91330332b`
- 本阶段对应章节：`docs/项目一阶段执行文档.md` 阶段 9；`docs/智能体设计.md` 第 12、27、28、40、41 节
- 本阶段不实现的章节：数据库持久化、LLM ReportAgent、完整红队玩法、策略进化

### 完成内容

- 新增 `Episode`、`EpisodeTurn`、`AgentStep` 类型，`TacticUse` 继续复用阶段 3/4 定义。
- 新增 `TurnLogRepository` 持久化接口和内存实现。
- 新增 `ReportBuilder`，从已记录聊天消息、事件行动、`TacticUse` 和状态字段生成 Episode 与解释，不调用模型推断玩家行为。
- `ReportService` 保持由 `ScoringService`/`EndingService` 决定分数和结局，报告构建器只追加解释和证据。
- `GameReport` 新增 AI 技能摘要、首次官方核实 turnId、矛盾识别、信息泄露总结、应急评价和 Episode。
- `ReportScreen` 新增“AI 技能与核实复盘”，展示技能解释、证据追踪、首次核实、泄露与应急状态。

### 验证记录

| 命令 | 结果 | 备注 |
|---|---|---|
| `npm run test -- tests/integration/reporting.test.ts tests/integration/defender-runtime.test.ts` | PASS | 2 files, 5 tests |
| `npm run build` | PASS | Next.js 16.2.6 production build |
| `npm run lint` | PASS | ESLint 通过 |
| `AI_ENABLED=false AI_PROVIDER=mock npm run test:e2e -- tests/e2e/defender-smoke.spec.ts` | PASS | desktop-chromium 和 mobile-375 共 6 tests |
| `AI_ENABLED=false AI_PROVIDER=mock npm run verify` | PASS | lint；18 files, 66 tests；Next.js build；desktop/mobile E2E 共 6 tests |

### 未完成

- Episode 当前为内存持久化，数据库接口迁移留到后续数据库/知识库阶段。
- 报告文本为规则构建，未接入 LLM ReportAgent；若未来接入，仍不得让模型决定分数或凭空补玩家行为。
