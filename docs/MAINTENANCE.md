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
| domain/gameModes.ts | ✅ | GameMode/Difficulty 归一化、防守/红队状态初始化与隔离校验 |
| domain/types/report.ts | ✅ | 含因果链字段 (v2) |
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
3. **EmergencyScreen的"查看复盘报告"按钮**：使用了硬编码事件ID，后续可以改为直接切换阶段。

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
