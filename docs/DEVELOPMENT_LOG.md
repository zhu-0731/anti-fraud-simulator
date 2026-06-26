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
