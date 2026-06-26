# MAINTENANCE.md — 《确认之前》维护文档

## 当前版本：MVP v2.0（聊天系统重构）

---

## 如何运行项目

```bash
cd anti-fraud-simulator
npm install
npm run dev       # 开发服务器，访问 http://localhost:3000
npm run build     # 生产构建（已验证通过）
npm run start     # 启动生产服务
```

## 如何运行测试

```bash
npm run lint       # ESLint
npm run test       # Vitest 单元/集成测试
npm run build      # Next.js 生产构建
npm run test:e2e   # Playwright 桌面和移动端冒烟测试
npm run verify     # lint + test + build + e2e
```

测试产物：

```text
playwright-report/
test-results/
coverage/
```

以上目录不提交 Git。`test:e2e` 使用生产构建和 `next start`，避免开发模式 HMR WebSocket 干扰浏览器日志判断。

---

## 已完成模块

| 模块 | 状态 | 说明 |
|------|------|------|
| domain/types/chat.ts | ✅ | Contact, ChatMessage, WorldState, PlayerIntent (v2) |
| domain/types/game.ts | ✅ | GameState含聊天系统字段和双模式骨架 |
| domain/types/defender.ts | ✅ | NarrativeStage 类型 |
| domain/types/tactic.ts | ✅ | TacticCard、TacticUse、RoleCard、ChannelCard 和 DefenseCapability |
| domain/gameModes.ts | ✅ | GameMode/Difficulty 归一化、防守/红队状态初始化与隔离校验 |
| domain/types/report.ts | ✅ | 含因果链字段 (v2) |
| domain/tactics/TacticRegistry.ts | ✅ | 八个核心技能、选择校验、重复使用衰减 |
| domain/tactics/RoleRegistry.ts | ✅ | 六类共享角色卡 |
| domain/tactics/ChannelRegistry.ts | ✅ | 六类共享渠道卡 |
| domain/tactics/EventCompatibility.ts | ✅ | 旧 pressureTypes/safeActions 到正式元数据的兼容映射 |
| domain/defender/DefenderStateReducer.ts | ✅ | 规则型防守状态 reducer，数值裁剪和阶段流转 |
| domain/defender/DefenderRuleEngine.ts | ✅ | 根据玩家意图和联系人记录 TacticUse 并更新 DefenderState |
| domain/defender/DefenderGameService.ts | ✅ | 防守模式应用服务，接管聊天 API route 的状态写回 |
| domain/defender/RuleNarrativeDirector.ts | ✅ | 现有 NarrativeDirector 的规则回退包装 |
| domain/defender/DefenderScoringService.ts | ✅ | 组合旧评分和新防守指标 |
| domain/defender/DefenseRule.ts | ✅ | 可复用 DefenseRule 接口 |
| domain/ai/gateway/AIGateway.ts | ✅ | 正式 AI Gateway，超时、重试、Schema、安全和回退 |
| domain/ai/gateway/OpenAIProvider.ts | ✅ | OpenAI/vivo 兼容 Chat Completions Provider |
| domain/ai/gateway/MockAIProvider.ts | ✅ | Gateway Mock Provider |
| domain/ai/gateway/schemas/EventCardSchema.ts | ✅ | Zod 运行时 Schema |
| domain/ai/gateway/AICallLogRepository.ts | ✅ | 内存 AI 调用日志 |
| domain/types/director.ts | ✅ | Director 输入/输出计划契约 |
| domain/agents/director/RuleDirectorAgent.ts | ✅ | 规则 Director，输出授权技能和阶段计划 |
| domain/agents/director/DirectorAgent.ts | ✅ | Director 包装器，主 Agent 失败时规则回退 |
| domain/types/riskActor.ts | ✅ | RiskActor 输入/输出契约 |
| domain/agents/risk/RiskActorAgent.ts | ✅ | 受控风险角色模板，只使用授权技能 |
| domain/types/supportAgent.ts | ✅ | SupportAgent 输入/输出契约 |
| domain/agents/support/SupportAgent.ts | ✅ | 六类支持角色规则模板 |
| domain/chat/IntentParser.ts | ✅ | 14意图，关键词匹配，接口预留LLM替换 |
| domain/chat/ChatService.ts | ✅ | 意图→Agent→安全过滤→叙事→状态更新 |
| domain/narrative/WorldState.ts | ✅ | createInitialWorldState + patchWorldState |
| domain/narrative/NarrativeDirector.ts | ✅ | WorldState数值驱动叙事阶段流转 |
| domain/narrative/DelayedConsequenceService.ts | ✅ | 延迟后果模板 |
| domain/agents/BaseAgent.ts | ✅ | IBaseAgent接口，MockAgent抽象类 |
| domain/agents/AgentRegistry.ts | ✅ | getAgent(contactId) + getAllAgents() |
| MomAgent | ✅ | 转发可疑链接，天真型 |
| CounselorAgent | ✅ | 可靠，始终指向官方渠道 |
| SeniorAgent | ✅ | 分享经历+可疑资源链接 |
| GroupAgent | ✅ | 多成员混合信息 |
| FakeAdmissionAgent | ✅ | 权威压力+截止压力（教育模拟，受模板约束）|
| OfficialSiteAgent | ✅ | 官方核验信息 |
| AntiFraudAgent | ✅ | 应急指引，96110 |
| API /api/chat/send | ✅ | 聊天消息发送 |
| API /api/chat/open-contact | ✅ | 打开联系人，清除未读 |
| API /api/narrative/tick | ✅ | 后台叙事推进 |
| API /api/game/start | ✅ | 统一启动入口；防守可运行，红队返回未启用契约 |
| GameEngine.startSession | ✅ | 初始化7个联系人+WorldState+聊天记录 |
| GameStartService | ✅ | 统一启动服务，保留旧防守流程兼容 |
| ReportService | ✅ | 含因果链、转折点、信任链分析 |
| gameStore | ✅ | sendMessage/openContact/setActiveView/narrativeTick |
| apiClient | ✅ | sendMessage/openContact/narrativeTick |
| ChatListScreen | ✅ | 联系人列表含未读徽标 |
| ChatWindow | ✅ | 单联系人聊天+自由文本输入+快捷建议 |
| BrowserView | ✅ | 模拟浏览器，倒计时，禁用表单，免责提示 |
| OfficialSiteView | ✅ | 官方核验入口，快捷操作 |
| PhoneView | ✅ | 电话模拟，官方vs可疑号码 |
| EvidenceView | ✅ | 证据板，使用说明 |
| BottomNavigation | ✅ | 5标签导航栏 |
| StatusBar | ✅ | 模糊状态标签（非原始数值）|
| DesktopLayout | ✅ | 调试面板默认隐藏，?debug=1可见 |
| page.tsx | ✅ | PlayingView含视图路由 |
| data/chapter01 | ✅ | 12个事件节点，每个4+行动 |
| ScoringService | ✅ | 5维度评分，总分100 |
| EndingService | ✅ | 5种结局判断 |
| SafetyFilterService | ✅ | 真实链接/支付信息过滤 |
| MockAIEventProvider | ✅ | 基于eventVariants的mock实现 |
| LangGraphEventProvider | ✅ | Stub + 完整TODO注释 |
| docs (4个文档) | ✅ | MAINTENANCE/ACCEPTANCE/ARCHITECTURE/AI_EXTENSION |

---

## 文件变更清单（v1.0）

```
src/
  app/
    page.tsx                    ← 已替换为游戏主页
    layout.tsx                  ← 已更新为中文SEO配置
    globals.css                 ← 已注入Campus Security Slate主题
    api/
      session/start/route.ts   ← 新增
      game/action/route.ts     ← 新增
      game/state/route.ts      ← 新增
      ai/generate-event/route.ts ← 新增
      report/generate/route.ts ← 新增
  components/
    layout/
      MobileFrame.tsx           ← 新增
      DesktopLayout.tsx         ← 新增（含调试面板）
    screens/
      StartScreen.tsx           ← 新增
      ProfileScreen.tsx         ← 新增
      GameScreen.tsx            ← 新增
      EmergencyScreen.tsx       ← 新增
      ReportScreen.tsx          ← 新增
    game/
      StatusBar.tsx             ← 新增
      MessageBubble.tsx         ← 新增
      ActionPanel.tsx           ← 新增
      EvidencePanel.tsx         ← 新增
      BrowserSimulation.tsx     ← 新增
      RiskMeter.tsx             ← 新增
      AnxietyMeter.tsx          ← 新增
    report/
      ScoreCard.tsx             ← 新增
      TimelineReview.tsx        ← 新增
      MistakeList.tsx           ← 新增
      AdvicePanel.tsx           ← 新增
  data/
    chapter01.ts                ← 新增（12个事件）
    playerProfiles.ts           ← 新增
    eventVariants.ts            ← 新增
  domain/
    types/
      game.ts                   ← 新增
      ai.ts                     ← 新增
      report.ts                 ← 新增
    entities/                   ← 接口已在types中定义
    repositories/
      GameSessionRepository.ts  ← 新增
      ChapterRepository.ts      ← 新增
    services/
      GameEngine.ts             ← 新增
      ScoringService.ts         ← 新增
      EndingService.ts          ← 新增
      ReportService.ts          ← 新增
      SafetyFilterService.ts    ← 新增
      EventSelectionService.ts  ← 新增
    ai/
      AIEventProvider.ts        ← 新增
      MockAIEventProvider.ts    ← 新增
      LangGraphEventProvider.ts ← 新增（Stub）
      AgentOrchestrator.ts      ← 新增
      prompts/
        eventGenerationPrompt.ts ← 新增
        reportPrompt.ts          ← 新增
  lib/
    apiClient.ts                ← 新增
    storage.ts                  ← 新增
    id.ts                       ← 新增
    clamp.ts                    ← 新增
  store/
    gameStore.ts                ← 新增
docs/
  MAINTENANCE.md               ← 本文件
  ACCEPTANCE.md                ← 新增
  ARCHITECTURE.md              ← 新增
  AI_EXTENSION.md              ← 新增
```

---

## 核心逻辑说明

### 事件流转
1. `GameStartService.startGame` 接收统一启动请求；防守模式委托 `GameEngine.startSession`，红队模式返回 `FEATURE_NOT_READY`
2. `GameEngine.startSession` 创建防守会话，从ChapterRepository获取第一个事件
3. `GameEngine.handleAction` 接收玩家行动
4. `GameEngine.applyActionEffects` 更新GameState（风险值、焦虑值、标记、证据等）
5. `EventSelectionService.getNextEventByRules` 根据动作结果和规则选择下一个事件
6. 如果触发了info泄露或资金损失，自动切换到emergency阶段
7. 最终切换到report阶段，调用ReportService生成报告

### 双模式骨架

- `GameMode` 当前支持 `defender` 和 `red_team`。
- `GameDifficulty` 当前支持 `beginner`、`standard`、`advanced`。
- 防守会话写入 `GameSessionRepository` 前会执行运行时校验，防止混入 `redTeamState`。
- 红队模式当前只返回 `FEATURE_NOT_READY` 合同和空 `RedTeamState`，完整红队玩法不得在阶段 10 前提前实现。

### 技能领域模型

- 八个核心技能由 `TacticRegistry` 管理，不直接塞入 `EventCard` 主体。
- 每个技能包含成本、冷却、最大强度、风险信号、防御能力、允许角色和允许渠道。
- 旧事件的 `pressureTypes` 和 `safeActions` 会在导出时映射为 `tacticIds` 和 `testedCapabilities`。
- `TacticUse` 已在聊天回合和旧事件卡行动中记录；Episode 持久化留到阶段 9。

### 规则型防守运行时

- `/api/chat/send` 和 `/api/chat/open-contact` 现在通过 `DefenderGameService` 访问领域层。
- `DefenderRuleEngine` 不调用 LLM，只根据本地意图解析、联系人和规则映射更新状态。
- `DefenderStateReducer` 负责所有防守状态数值变更和阶段流转。
- `RuleNarrativeDirector` 是后续 AI Director 失败时的规则回退点。
- `EmergencyScreen` 在聊天路径触发应急时会固定使用 E11 应急事件，保证风险路径有可执行处置动作。

### AI Gateway

- 正式 AI 入口是 `src/domain/ai/gateway/AIGateway.ts`。
- 旧 `OpenAICompatibleEventProvider` 保留为历史实验原型，不是正式 Gateway。
- Gateway 默认可走 `mock`，`AI_ENABLED=false` 或错误时回退 Mock。
- vivo 兼容调用使用 `OPENAI_COMPATIBLE_BASE_URL`、`OPENAI_COMPATIBLE_MODEL`、`OPENAI_COMPATIBLE_API_KEY`；也支持空模板变量 `VIVO_APP_ID` / `VIVO_APP_KEY`。
- Gateway 不读取 `api_key.txt`，真实密钥只允许放本地 `.env.local`。
- live 模型验收未执行；当前通过 Mock、非法输出、超时、限流和回退测试验证。

### DirectorAgent

- Director 只输出计划，不输出聊天文本。
- `RuleDirectorAgent` 根据 `DefenderState`、玩家意图、历史 `TacticUse` 和难度选择授权技能。
- 技能选择必须通过 `TacticRegistry.validateTacticSelection()`。
- `DirectorAgent` 包装器用于后续 AI Director；当前主实现仍是规则 Director。

### RiskActorAgent

- `RiskActorAgent` 接收 DirectorPlan，不自行选择技能。
- 角色和渠道必须允许对应技能，否则不会生成该技能的 `TacticUse`。
- 当前实现是教育模拟模板，后续可替换为 Gateway 结构化输出。

### SupportAgent

- `SupportAgent` 覆盖家人、同伴、群聊、辅导员、官方服务和反诈咨询。
- 家人/同伴/群聊可以不完整，但必须引导核实。
- 辅导员/官方/反诈为 authoritative，不能给风险操作。
- 当前实现是规则模板，尚未替换旧 `AgentRegistry` 中的 UI 聊天 Agent。

### Defender Interaction

- StartScreen 提供防守模式、红队占位、难度选择和任务背景。
- 官网页的“完成核实并查看复盘”是安全路径正式收口，仍通过 `sendMessage('official_service', ...)` 更新服务端状态。
- 电话页只负责展示通话结果和记录核实进度，不应自动跳转复盘页。
- 应急页复盘按钮直接切换到 `report` 阶段，不再依赖旧事件卡动作。
- `NarrativeDirector` 的 intent/contact 数值变更按增量累计；不要在交互阶段改回覆盖语义。
- 普通玩家界面不得显示 `WorldState`、`DefenderState`、`TacticUse`、技能标签或 DirectorPlan；这些只能在 `?debug=1` 调试面板出现。

### 评分体系
- 风险识别 35分：每个risky行动 -7分，safe/verify行动 +3分（上限+10）
- 核验路径 25分：官方核验+15，辅导员确认+5，官网检查+5
- 任务完成 15分：完成录取确认即满分
- 应急处置 15分：没有触发应急=满分；触发后按完成的关键步骤计分
- 复盘理解 10分：每个证据+3分（上限10）

### 结局判断
```
moneyLost > 0 && !emergencyHandled → fully_scammed
moneyLost > 0 && emergencyHandled → money_lost_but_handled
sensitiveInfoLeaked && !moneyLost → info_leaked
officialVerified && taskCompleted && riskyActions > 0 → near_miss
otherwise → safe_confirmed
```

---

## 已知问题

1. **服务器重启丢失会话**：GameSessionRepository是内存实现，服务器重启后会话丢失。前端会自动重新开始。
2. **ProfileScreen未从StartScreen流入**：当前版本startGame后直接进入playing阶段，profile阶段需手动调用setPhase。可以在StartScreen添加一个"查看角色"步骤。

---

## 下一步计划

### v1.1 - 体验改进
- [ ] StartScreen流程：开始 → 角色档案 → 游戏（三步流程）
- [ ] 添加音效支持（可选）
- [ ] 完善事件标题在时间轴中的显示（当前用ID代替）
- [ ] 添加倒计时动画组件

### v1.2 - AI接入
- [ ] 接入Anthropic API（claude-sonnet-4-6）
- [ ] LangGraphEventProvider实现（需安装@langchain/langgraph）
- [ ] AgentOrchestrator多Agent编排

### v1.3 - 持久化
- [ ] 替换GameSessionRepository为数据库实现（Prisma + SQLite或PostgreSQL）
- [ ] 用户账号系统（可选）
- [ ] 历史记录查询

### v1.4 - 内容扩展
- [ ] 第二章：网购退款诈骗
- [ ] 第三章：兼职刷单诈骗
- [ ] 更多事件变体
- [ ] 多语言支持

---

## 如何验收功能

详见 `docs/ACCEPTANCE.md`
