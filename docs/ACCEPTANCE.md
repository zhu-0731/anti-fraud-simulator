# ACCEPTANCE.md — 功能验收清单

## 当前验证状态

最近一次本地验证：

| 命令 | 状态 |
|------|------|
| npm run lint | ✅ |
| npm run test | ✅ |
| npm run build | ✅ |
| npm run test:e2e | ✅ |
| npm run verify | ✅ |

## 阶段 2：双模式领域骨架验收

| 验收项 | 预期 | 状态 |
|--------|------|------|
| GameMode 类型 | 支持 `defender` / `red_team` | ✅ |
| GameDifficulty 类型 | 支持 `beginner` / `standard` / `advanced` | ✅ |
| 统一启动 API | `POST /api/game/start` 可启动防守模式 | ✅ |
| 旧启动 API 兼容 | `/api/session/start` 仍可启动原流程 | ✅ |
| 红队未启用契约 | `red_team` 返回 `FEATURE_NOT_READY` | ✅ |
| 状态隔离 | 防守会话不得包含 `redTeamState` | ✅ |
| 原流程不回归 | 桌面和移动端冒烟 E2E 通过 | ✅ |

## 阶段 3：技能、角色和渠道领域模型验收

| 验收项 | 预期 | 状态 |
|--------|------|------|
| 八个核心技能 | 全部由统一 Registry 管理 | ✅ |
| 技能风险信号 | 每个技能至少一个 `observableSignal` | ✅ |
| 技能防御方法 | 每个技能至少一个 `defenderCounter` | ✅ |
| 技能成本和冷却 | 策略点、冷却和前置条件有测试 | ✅ |
| 禁止无限叠加 | 同轮重复技能被拒绝，重复使用有效果衰减 | ✅ |
| 角色卡 | 六类角色卡均引用有效技能和渠道 | ✅ |
| 渠道卡 | 六类渠道卡均可被两个模式复用 | ✅ |
| 旧事件映射 | E01-E12 和 Mock 事件无未知旧标签 | ✅ |
| 旧字段保留 | `pressureTypes/riskSignals/safeActions/actions` 未删除 | ✅ |

## 阶段 4：规则型防守运行时验收

| 验收项 | 预期 | 状态 |
|--------|------|------|
| Rule 模式不依赖 LLM | `AI_ENABLED=false` 下 E2E 通过 | ✅ |
| DefenderStateReducer | 确定性更新并裁剪 0-100 数值 | ✅ |
| DefenderRuleEngine | 聊天回合记录 `TacticUse` | ✅ |
| 旧事件卡兼容 | 事件卡行动也记录 `TacticUse` | ✅ |
| 防守应用服务 | 聊天 API route 通过 `DefenderGameService` 写回状态 | ✅ |
| 安全路径 E2E | 桌面和移动端冒烟路径通过 | ✅ |
| 风险路径 E2E | 提交模拟信息后进入应急阶段 | ✅ |
| 应急动作可用 | 聊天触发应急后展示 E11 处置动作 | ✅ |

## 阶段 5：AI Gateway 验收

| 验收项 | 预期 | 状态 |
|--------|------|------|
| 正式 Gateway | `/api/ai/generate-event` 使用 `AIGateway` | ✅ |
| Provider 接口 | Agent 不直接实例化模型 SDK | ✅ |
| Structured Output | EventCard 输出经过 Zod Schema | ✅ |
| Schema 非法回退 | 缺字段、非法 JSON、额外字段被拒绝 | ✅ |
| 超时回退 | AbortController 超时返回 Mock fallback | ✅ |
| 有限重试 | 可重试错误最多重试一次 | ✅ |
| 安全输入 | Prompt injection 类输入被阻断 | ✅ |
| 安全输出 | 真实 URL 输出触发回退 | ✅ |
| 缺 key / AI 关闭 | 不影响 Mock/Rule 路径 | ✅ |
| 调用日志 | 记录 requestId、errorCode、fallbackUsed、retryCount | ✅ |
| live 模型验收 | 真实 vivo/OpenAI 调用 | 未执行 |

## v2.0 聊天系统验收

| 验收项 | 预期 | 状态 |
|--------|------|------|
| npm run build 通过 | 0 TypeScript错误，8个Route Handler注册 | ✅ |
| 7个联系人初始化 | 开始游戏后Chat List显示7个联系人 | ✅ |
| 自由文本输入 | ChatWindow文本框可输入，Enter发送 | ✅ |
| 快捷建议按钮 | ChatWindow底部显示5条建议，点击填充 | ✅ |
| Agent回复 | 各联系人根据玩家意图给出不同回复 | ✅ |
| 未读徽标 | 联系人列表显示未读数，打开后清零 | ✅ |
| BottomNavigation | 5个标签：消息/浏览器/官网/电话/证据 | ✅ |
| BrowserView倒计时 | 访问fake-confirm页面显示倒计时 | ✅ |
| BrowserView禁用表单 | 表单字段为只读，显示"模拟输入"提示 | ✅ |
| OfficialSiteView快捷操作 | 点击发送消息到official_service联系人 | ✅ |
| PhoneView拨打 | 官方号码有正面结果，可疑号码无法接通 | ✅ |
| EvidenceView | 截图保存的证据列出，含使用说明 | ✅ |
| WorldState更新 | ChatService.sendMessage后worldState数值变化 | ✅ |
| 叙事阶段流转 | authorityPressure>30时新通知出现 | ✅ |
| 延迟后果 | 报告页显示delayedConsequences和turningPoints | ✅ |
| 因果链分析 | 信任链分析/压力链摘要/恢复评估 | ✅ |
| 调试面板隐藏 | 默认不显示，?debug=1可见 | ✅ |
| StatusBar模糊标签 | 显示"轻微风险"等文字而非数值 | ✅ |

## v1.0 功能验收

| 验收项 | 预期 | 状态 |
|--------|------|------|
| npm install && npm run dev 启动 | 访问 http://localhost:3000 正常显示 | ✅ |
| 完整游戏流程 | 开始 → 游戏 → 报告，流程完整 | ✅ |
| 5种结局 | safe_confirmed/near_miss/info_leaked/money_lost_but_handled/fully_scammed | ✅ |
| 应急处置阶段 | 触发submittedInfoLevel>20时进入EmergencyScreen | ✅ |
| 复盘报告 | 含评分、时间轴、因果链、建议 | ✅ |
| API可用性 | 9个Route Handler全部注册 | ✅ |
| docs文档 | 4个文档文件完整 | ✅ |
| 核心逻辑集中 | React组件不含业务判断 | ✅ |

---

## UI验收

| 验收项 | 预期 | 状态 |
|--------|------|------|
| 375px宽度无横向滚动 | overflow-x: hidden + max-width限制 | ✅ |
| 360-430px宽度适配 | MobileFrame响应式设计 | ✅ |
| 行动按钮高度 ≥44px | ActionPanel minHeight: 44 | ✅ |
| 消息区可滚动 | GameScreen overflow-y: auto | ✅ |
| 状态栏始终可见 | StatusBar sticky top-0 z-20 | ✅ |
| 风险值和焦虑值清晰显示 | RiskMeter + AnxietyMeter | ✅ |
| 桌面端正常显示 | DesktopLayout居中 + 右侧调试面板 | ✅ |
| 手机模拟器居中 | max-width: 430px centered | ✅ |
| 整体风格接近聊天模拟器 | MessageBubble + 渠道颜色标识 | ✅ |

---

## 教育效果验收

| 验收项 | 预期 | 状态 |
|--------|------|------|
| 每个事件有教学点 | teachingPoint字段 | ✅ |
| 风险信号可识别 | riskSignals字段在事件中标注 | ✅ |
| 行动有教学反馈 | action.feedback字段 | ✅ |
| 复盘报告含现实建议 | realWorldAdvice按结局定制 | ✅ |
| 96110热线提示 | AdvicePanel底部固定显示 | ✅ |
| 涵盖主要诈骗手法 | 权威冒充/紧迫压力/从众心理/倒计时/木马软件 | ✅ |

---

## 安全验收

| 验收项 | 预期 | 状态 |
|--------|------|------|
| 所有链接为模拟域名 | game-simulated-link.local | ✅ |
| BrowserSimulation有免责声明 | "请勿填写真实信息"警告 | ✅ |
| 输入框为只读 | readOnly属性 | ✅ |
| 不保存真实内容 | 无input onChange handler | ✅ |
| 不出现真实收款账户 | SafetyFilterService过滤 | ✅ |
| SafetyFilterService位于AI输出之间 | MockAIEventProvider内部调用 + AgentOrchestrator二次验证 | ✅ |
| AI生成内容经过过滤 | /api/ai/generate-event必经SafetyFilter | ✅ |
| 无真实诈骗执行细节 | 所有事件为教育模拟，不含可复用话术 | ✅ |

---

## 性能验收

| 验收项 | 预期 | 状态 |
|--------|------|------|
| npm run build通过 | ✓ Compiled successfully | ✅ |
| 首屏加载 | 静态页面，无首屏阻塞 | ✅ |
| API结构 | Route Handler同步处理，小型本地会话下无外部IO | ✅ |
| 内存占用 | 会话内存存储，小型项目可接受 | ✅ |

---

## 手动验收步骤（v2.0）

```
1. cd anti-fraud-simulator && npm run dev
2. 打开 http://localhost:3000
3. 点击"开始模拟" → 进入聊天列表
4. 打开"保研互助群"→ 输入"这个链接安全吗？" → 确认群成员回复
5. 打开"招生办-张老师（未认证）"→ 输入"请问怎么核实你的身份？" → 观察施压回复
6. 切换至底栏"官网" → 点击"核实录取信息" → 切回消息，观察official_service回复
7. 切换至底栏"电话" → 拨打96110 → 阅读反诈中心回复
8. 回到张老师聊天 → 输入"我来提交信息" → 观察worldState变化（?debug=1可见）
9. 检查StatusBar显示"中等风险"或更高警示
10. 确认应急阶段触发（submittedInfoLevel>20）
11. 确认报告包含因果链分析和转折点

12. 重新开始，全程联系counselor和official_service核实
13. 确认结局为"稳健确认"，报告因果链显示正面评价

14. 访问 http://localhost:3000/?debug=1 确认调试面板出现
15. 缩小到375px宽度，确认无横向滚动
16. 确认BrowserView假表单显示"模拟输入·请勿填写真实信息"

API测试：
    POST /api/game/start {"mode":"defender","chapterId":"chapter_recommendation_001","difficulty":"beginner"}
    POST /api/session/start {"chapterId":"chapter_recommendation_001"}
    POST /api/chat/send {"sessionId":"xxx","contactId":"fake_admission","text":"我要核实身份"}
    POST /api/chat/open-contact {"sessionId":"xxx","contactId":"counselor"}
    POST /api/narrative/tick {"sessionId":"xxx","contactId":"group"}
    POST /api/report/generate {"sessionId":"xxx"}
```
