# ACCEPTANCE.md — 功能验收清单

## 功能验收

| 验收项 | 预期 | 状态 |
|--------|------|------|
| npm install && npm run dev 启动 | 访问 http://localhost:3000 正常显示 | ✅ |
| npm run build 通过 | 无TypeScript错误，无编译错误 | ✅ |
| 完整游戏流程 | 开始 → 游戏 → 报告，流程完整 | ✅ |
| 事件数量 | 至少12个事件节点 | ✅ E01-E12 |
| 每事件行动数量 | 至少4个行动选项 | ✅ |
| 行动影响风险值 | risky行动增加风险值 | ✅ |
| 行动影响焦虑值 | 倒计时事件、催促事件增加焦虑值 | ✅ |
| 证据链记录 | evidence类行动添加证据 | ✅ |
| 行为日志记录 | 每个行动记录到actionHistory | ✅ |
| 3种以上结局 | safe_confirmed/near_miss/info_leaked/money_lost_but_handled/fully_scammed | ✅ 5种 |
| 应急处置阶段 | 触发info泄露或资金损失时进入EmergencyScreen | ✅ |
| 复盘报告 | 引用玩家具体行为，包含评分和建议 | ✅ |
| API可用性 | 5个Route Handler全部注册 | ✅ |
| MockAIEventProvider | 文件存在，可正常调用 | ✅ |
| LangGraphEventProvider | 文件存在，包含TODO注释 | ✅ |
| AgentOrchestrator | 文件存在，包含多Agent扩展点 | ✅ |
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
| API响应 | Route Handler同步处理，响应< 100ms | ✅ |
| 内存占用 | 会话内存存储，小型项目可接受 | ✅ |

---

## 手动验收步骤

```
1. cd anti-fraud-simulator && npm run dev
2. 打开 http://localhost:3000
3. 点击"开始模拟"
4. 按顺序体验事件E01-E12
5. 在E06中选择"发送手机号和身份证号"触发应急阶段
6. 完成3个应急行动
7. 点击"查看复盘报告"
8. 确认报告显示正确的结局和评分

9. 重新开始，这次全程选择safe/verify行动
10. 确认最终结局为"稳健确认"

11. 检查桌面浏览器：右侧应显示调试面板
12. 缩小浏览器到375px宽度：应无横向滚动

13. 使用浏览器开发者工具测试API：
    POST /api/session/start {"chapterId": "chapter_recommendation_001"}
    GET /api/game/state?sessionId=xxx
    POST /api/game/action {"sessionId":"xxx","eventId":"E01","actionId":"note_warning"}
    POST /api/ai/generate-event {"sessionId":"xxx","teachingGoal":"authority_impersonation"}
    POST /api/report/generate {"sessionId":"xxx"}
```
