# MAINTENANCE.md — 《确认之前》维护文档

## 当前版本：MVP v1.0

---

## 如何运行项目

```bash
cd anti-fraud-simulator
npm install
npm run dev       # 开发服务器，访问 http://localhost:3000
npm run build     # 生产构建（已验证通过）
npm run start     # 启动生产服务
```

---

## 已完成模块

| 模块 | 状态 | 说明 |
|------|------|------|
| domain/types | ✅ | game.ts / ai.ts / report.ts |
| data/chapter01 | ✅ | 12个事件节点，每个4+行动 |
| data/playerProfiles | ✅ | 大四学生陈莉档案 |
| data/eventVariants | ✅ | 3类AI事件变体 |
| repositories | ✅ | 内存Mock实现，接口已设计好 |
| GameEngine | ✅ | startSession/handleAction/applyActionEffects |
| ScoringService | ✅ | 5维度评分，总分100 |
| EndingService | ✅ | 5种结局判断 |
| ReportService | ✅ | 复盘报告生成 |
| SafetyFilterService | ✅ | 真实链接/支付信息过滤 |
| EventSelectionService | ✅ | 规则驱动事件流转 |
| AIEventProvider接口 | ✅ | 标准接口定义 |
| MockAIEventProvider | ✅ | 基于eventVariants的mock实现 |
| LangGraphEventProvider | ✅ | Stub + 完整TODO注释 |
| AgentOrchestrator | ✅ | 多Provider路由 + 安全过滤 |
| AI Prompts模板 | ✅ | eventGenerationPrompt + reportPrompt |
| API Routes (5个) | ✅ | session/start, game/action, game/state, ai/generate-event, report/generate |
| Zustand Store | ✅ | 含localStorage持久化 |
| apiClient | ✅ | 类型安全的fetch封装 |
| StartScreen | ✅ | 开始页 |
| ProfileScreen | ✅ | 角色档案页 |
| GameScreen | ✅ | 主游戏界面 |
| EmergencyScreen | ✅ | 应急处置界面 |
| ReportScreen | ✅ | 复盘报告界面 |
| StatusBar | ✅ | 风险值/焦虑值/阶段 |
| MessageBubble | ✅ | 多渠道消息气泡 |
| ActionPanel | ✅ | 行动按钮面板 |
| EvidencePanel | ✅ | 证据链面板 |
| BrowserSimulation | ✅ | 模拟浏览器（含防护提示）|
| ScoreCard | ✅ | 评分卡片 |
| TimelineReview | ✅ | 行动时间轴 |
| MistakeList | ✅ | 错误操作列表 |
| AdvicePanel | ✅ | 现实建议 |
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
1. `GameEngine.startSession` 创建会话，从ChapterRepository获取第一个事件
2. `GameEngine.handleAction` 接收玩家行动
3. `GameEngine.applyActionEffects` 更新GameState（风险值、焦虑值、标记、证据等）
4. `EventSelectionService.getNextEventByRules` 根据动作结果和规则选择下一个事件
5. 如果触发了info泄露或资金损失，自动切换到emergency阶段
6. 最终切换到report阶段，调用ReportService生成报告

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
