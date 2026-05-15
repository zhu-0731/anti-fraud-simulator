# AI_EXTENSION.md — AI扩展设计文档

## 当前MockAIEventProvider实现方式

```
src/domain/ai/MockAIEventProvider.ts
```

工作原理：
1. 接收`AIEventGenerationInput`（包含teachingGoal、sessionId、当前状态）
2. 从`eventVariants.ts`中查找匹配teachingGoal的事件池
3. 排除已在actionHistory中出现的事件（避免重复）
4. 返回符合`AIEventOutput`格式的结果
5. 输出经过`SafetyFilterService`过滤

支持的teachingGoal：
- `authority_impersonation`：权威冒充
- `urgency_pressure`：紧急压力
- `peer_pressure`：从众压力

---

## AIEventProvider接口说明

```typescript
// src/domain/ai/AIEventProvider.ts
export interface AIEventProvider {
  name: string;
  generateEvent(input: AIEventGenerationInput): Promise<AIEventOutput>;
}

// 输入
export interface AIEventGenerationInput {
  sessionId: string;
  teachingGoal: string;       // 教学目标，决定生成什么类型的事件
  currentRiskScore: number;   // 当前风险分，用于控制难度
  currentAnxietyScore: number;
  flags: Record<string, boolean>; // 已触发的状态标记
  actionHistory: string[];    // 已发生的事件ID列表（避免重复）
  chapterId: string;
}

// 输出
export interface AIEventOutput {
  event: EventCard;           // 生成的事件卡片
  provider: string;           // 使用的Provider名称
  confidence?: number;        // AI置信度（0-1）
  reasoning?: string;         // 生成理由（用于调试）
}
```

---

## AgentOrchestrator设计

```
src/domain/ai/AgentOrchestrator.ts
```

当前功能：
- `selectProvider(name)`: 按名称路由到对应Provider
- `generateEventWithSafetyFilter(input, providerName)`: 生成事件并二次安全过滤
- `recordAgentTrace(sessionId, step)`: 记录Agent调用轨迹

未来多Agent扩展点：
```
DirectorAgent   → 控制剧情节奏，决定下一个教学目标
RiskEventAgent  → 生成风险事件内容
DefenderAgent   → 评估玩家防守行为，调整难度
SafetyAgent     → 内容安全审核
ReportAgent     → 生成个性化复盘分析
```

扩展示例：
```typescript
// 在AgentOrchestrator.ts中添加
async orchestrateWithMultipleAgents(input: AIEventGenerationInput) {
  // DirectorAgent决定教学目标
  const goal = await this.directorAgent.selectGoal(input);
  
  // RiskEventAgent生成事件
  const rawEvent = await this.riskEventAgent.generate({ ...input, teachingGoal: goal });
  
  // SafetyAgent过滤
  const safeEvent = await this.safetyAgent.filter(rawEvent);
  
  // 记录轨迹
  this.recordAgentTrace(input.sessionId, { ... });
  
  return safeEvent;
}
```

---

## 后续接入LangGraph的位置

### 文件位置
```
src/domain/ai/LangGraphEventProvider.ts
```

### LangGraph节点设计

```
输入: AIEventGenerationInput
  ↓
StateLoaderNode
  - 将AIEventGenerationInput转为LangGraph状态对象
  - 加载当前会话上下文
  ↓
DirectorNode
  - 分析当前游戏节奏（风险分、已触发标记）
  - 决定下一个事件的类型和难度
  - 输出: { eventType, difficulty, teachingGoal }
  ↓
RiskEventGeneratorNode
  - 调用LLM API（claude-sonnet-4-6 或 claude-opus-4-7）
  - 使用eventGenerationPrompt模板
  - 输出: 原始EventCard JSON
  ↓
SafetyFilterNode
  - 调用SafetyFilterService.filterEvent()
  - 如果不通过，回到RiskEventGeneratorNode（最多重试3次）
  ↓
EventValidationNode
  - 验证EventCard结构完整性
  - 检查actions数量（≥4）
  - 检查必填字段
  ↓
输出: AIEventOutput
```

### 接入步骤

1. 安装依赖：
```bash
npm install @langchain/langgraph @langchain/anthropic
```

2. 在`LangGraphEventProvider.ts`中取消TODO注释：
```typescript
async generateEvent(input: AIEventGenerationInput): Promise<AIEventOutput> {
  const graph = await buildAntiFraudGraph();  // 在同目录新建graph.ts
  const result = await graph.invoke({
    sessionId: input.sessionId,
    teachingGoal: input.teachingGoal,
    currentRiskScore: input.currentRiskScore,
    flags: input.flags,
  });
  return result.eventOutput;
}
```

3. 在`.env.local`中配置：
```
ANTHROPIC_API_KEY=your_api_key_here
AI_PROVIDER=langgraph
LANGGRAPH_ENABLED=true
```

4. 切换Provider：
`AgentOrchestrator`会根据`AI_PROVIDER`环境变量自动路由到LangGraph Provider。

---

## 后续接入真实LLM API的参数位置

### Prompt模板
```
src/domain/ai/prompts/eventGenerationPrompt.ts  ← 事件生成prompt
src/domain/ai/prompts/reportPrompt.ts           ← 复盘报告prompt
```

### API调用位置（示例）
```typescript
// 在RiskEventGeneratorNode或直接在LangGraphEventProvider中
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const message = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 2048,
  messages: [
    {
      role: 'user',
      content: buildEventGenerationPrompt(input),
    }
  ],
});

// 解析JSON输出
const eventCard = JSON.parse(message.content[0].text) as EventCard;
```

### 推荐模型配置
- 事件生成：`claude-sonnet-4-6`（速度与质量平衡）
- 报告生成：`claude-opus-4-7`（需要更深入的分析）
- 安全过滤：无需LLM，使用本地SafetyFilterService

---

## 安全过滤要求

所有AI生成内容在进入游戏引擎之前必须经过：

1. **SafetyFilterService.filterEvent()**
   - 替换真实链接
   - 替换支付账号信息
   - 添加模拟声明

2. **SafetyFilterService.validateNoSensitiveInstruction()**
   - 检测危险指令模式
   - 返回blockedReasons列表

3. **AgentOrchestrator二次验证**
   - 即使Provider内部已过滤，Orchestrator层面还会再次调用filterEvent
   - 双重保护，防止Provider实现不一致

### 过滤不通过时的处理
- Mock Provider：抛出Error，让API返回500
- LangGraph Provider：回到生成节点重试（最多3次），仍不通过则使用fallback事件

---

## AI输出JSON Schema

```json
{
  "type": "object",
  "required": ["id", "title", "phase", "channel", "senderName", "senderRole", 
               "message", "surfaceTrust", "trueRiskLevel", "pressureTypes",
               "riskSignals", "safeActions", "actions", "nextEventRules", "teachingPoint"],
  "properties": {
    "id": { "type": "string", "pattern": "^AI_[A-Z]+_[0-9]{2}$" },
    "title": { "type": "string", "maxLength": 30 },
    "phase": { "type": "string", "enum": ["playing"] },
    "channel": { "type": "string", "enum": ["wechat","sms","email","browser","call","official_site"] },
    "senderName": { "type": "string" },
    "senderRole": { "type": "string" },
    "message": { "type": "string", "maxLength": 500 },
    "surfaceTrust": { "type": "number", "minimum": 0, "maximum": 100 },
    "trueRiskLevel": { "type": "string", "enum": ["none","low","medium","high","critical"] },
    "pressureTypes": { "type": "array", "items": { "type": "string" } },
    "riskSignals": { "type": "array", "items": { "type": "string" }, "minItems": 1 },
    "safeActions": { "type": "array", "items": { "type": "string" } },
    "actions": {
      "type": "array",
      "minItems": 4,
      "items": {
        "type": "object",
        "required": ["id", "label", "category", "riskScoreDelta", "anxietyScoreDelta", "feedback"],
        "properties": {
          "id": { "type": "string" },
          "label": { "type": "string", "maxLength": 40 },
          "category": { "type": "string", "enum": ["risky","verify","evidence","ignore","safe","emergency"] },
          "riskScoreDelta": { "type": "number", "minimum": -30, "maximum": 40 },
          "anxietyScoreDelta": { "type": "number", "minimum": -25, "maximum": 25 },
          "feedback": { "type": "string", "maxLength": 200 }
        }
      }
    },
    "nextEventRules": { "type": "array" },
    "teachingPoint": { "type": "string", "maxLength": 150 }
  }
}
```

---

## 安全边界

禁止AI生成以下内容，SafetyFilterService会检测和拦截：
1. 真实可访问的URL（非 game-simulated-link.local 域名）
2. 真实银行账号、支付账号格式
3. 可直接复用的诈骗话术模板
4. 引导玩家对真实系统进行操作的指令
5. 伪造真实机构名称（只能使用"Z大学"等虚构名称）
