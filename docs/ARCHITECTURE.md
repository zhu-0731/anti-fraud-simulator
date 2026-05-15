# ARCHITECTURE.md — 架构设计文档

## 前后端分层架构

```
┌─────────────────────────────────────────┐
│              浏览器 (Client)              │
│                                         │
│  React Components (只负责渲染和事件分发) │
│  Zustand Store (轻量客户端状态)          │
│  apiClient.ts (HTTP请求封装)             │
│  localStorage (会话ID持久化)             │
└─────────────────┬───────────────────────┘
                  │ HTTP (fetch)
┌─────────────────▼───────────────────────┐
│         Next.js Route Handlers           │
│   (src/app/api/**/route.ts)             │
│                                         │
│   POST /api/session/start               │
│   GET  /api/game/state                  │
│   POST /api/game/action                 │
│   POST /api/ai/generate-event           │
│   POST /api/report/generate             │
└─────────────────┬───────────────────────┘
                  │ 函数调用
┌─────────────────▼───────────────────────┐
│         Domain Services Layer            │
│   (src/domain/services/)               │
│                                         │
│   GameEngine           ← 核心游戏引擎   │
│   ScoringService       ← 评分计算       │
│   EndingService        ← 结局判断       │
│   ReportService        ← 报告生成       │
│   SafetyFilterService  ← 安全过滤       │
│   EventSelectionService ← 事件流转      │
└────────────┬──────────────┬─────────────┘
             │              │
┌────────────▼───┐  ┌───────▼─────────────┐
│  Repositories  │  │    AI Layer          │
│                │  │  (src/domain/ai/)    │
│  GameSession   │  │                      │
│  Repository    │  │  AIEventProvider     │
│  (in-memory)   │  │  MockAIEventProvider │
│                │  │  LangGraphProvider   │
│  Chapter       │  │  AgentOrchestrator   │
│  Repository    │  │                      │
│  (static data) │  └──────────────────────┘
└────────────────┘
```

---

## API设计

所有API遵循REST风格，使用JSON格式。

### POST /api/session/start
创建新游戏会话，返回sessionId和首个事件。

```json
Request:  { "chapterId": "chapter_recommendation_001" }
Response: { "sessionId": "...", "state": {...}, "firstEvent": {...} }
```

### GET /api/game/state?sessionId=xxx
获取当前游戏状态和当前事件。

```json
Response: { "state": {...}, "currentEvent": {...} }
```

### POST /api/game/action
提交玩家行动，返回更新后的状态和下一个事件。

```json
Request:  { "sessionId": "...", "eventId": "E04", "actionId": "check_official_site" }
Response: { "state": {...}, "nextEvent": {...}, "feedback": "..." }
```

### POST /api/ai/generate-event
调用AI事件生成器（当前为Mock）。

```json
Request:  { "sessionId": "...", "teachingGoal": "authority_impersonation" }
Response: { "event": {...}, "provider": "mock", "confidence": 0.85 }
```

### POST /api/report/generate
生成复盘报告。

```json
Request:  { "sessionId": "..." }
Response: { "report": { "score": {...}, "timeline": [...], ... } }
```

---

## Domain Services设计

### GameEngine
核心游戏引擎，负责：
- 会话创建和初始化
- 接收玩家行动并计算效果
- 选择下一个事件
- 触发阶段切换（playing → emergency → report）

所有状态变更通过`applyActionEffects`方法集中处理，不允许在其他地方直接修改GameState。

### ScoringService
纯函数评分，输入GameState，输出ScoreBreakdown（5维度+总分）。
- 不依赖外部服务
- 确定性计算，相同输入=相同输出

### EndingService
根据GameState的关键标志位（moneyLost/sensitiveInfoLeaked/officialVerified等）确定结局类型。

### SafetyFilterService
位于AI输出和游戏事件入库之间，过滤：
- 真实链接 → 替换为 game-simulated-link.local/blocked
- 支付账号信息 → 替换为 [模拟支付信息]
- 浏览器类事件 → 添加模拟声明前缀
- 危险指令检测 → 返回blockedReasons

---

## Repository设计

### 接口设计
```typescript
interface IGameSessionRepository {
  create(state: GameState): Promise<void>;
  findById(sessionId: string): Promise<GameState | null>;
  update(state: GameState): Promise<void>;
  delete(sessionId: string): Promise<void>;
}
```

### 当前实现
- `InMemoryGameSessionRepository`：基于`Map<string, GameState>`
- 使用`structuredClone`保证不可变性
- 导出单例`gameSessionRepository`

### 后续数据库替换方案
无需修改任何Service代码，只需：
1. 实现`IGameSessionRepository`接口（使用Prisma/Drizzle等ORM）
2. 将导出的单例替换为数据库实现

```typescript
// 替换前
export const gameSessionRepository = new InMemoryGameSessionRepository();

// 替换后
export const gameSessionRepository = new PrismaGameSessionRepository(prismaClient);
```

---

## 为什么核心逻辑不写在React组件里

### 问题
如果游戏逻辑（评分、结局判断、事件流转）写在React组件里：
1. 难以测试：需要渲染DOM才能验证逻辑
2. 难以复用：逻辑与UI强耦合
3. 难以扩展：添加新功能需要改组件
4. 难以维护：业务逻辑分散在多处

### 本项目的做法
- React组件 = 纯渲染器，只负责调用API和展示结果
- Domain Services = 所有业务判断的唯一来源
- API Routes = 前后端的清晰边界

### 组件职责说明
```
GameScreen.tsx:
  - 渲染messageHistory中的消息
  - 渲染currentEvent.actions中的按钮
  - 调用store.submitAction()
  - 不包含任何分数计算或结局判断

GameEngine.ts:
  - 所有状态变更逻辑
  - 事件流转规则
  - 阶段切换判断
```

---

## 当前Mock存储方案

- `GameSessionRepository`：进程内Map，重启丢失
- `ChapterRepository`：静态import，无IO
- localStorage：前端仅存sessionId，用于页面刷新后恢复

适合MVP演示阶段。生产环境需要替换Repository实现。
