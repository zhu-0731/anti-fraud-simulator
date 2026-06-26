# Anti-Fraud Simulator

一个面向学生录取场景的反诈教育模拟器。玩家扮演推免学生，在聊天、浏览器、官网、电话和证据收集等界面中识别“保研录取确认”类诈骗，并在结局复盘中查看风险链条、关键决策和现实处置建议。

## 功能概览

- 聊天式互动：妈妈、辅导员、学长、保研群、假招生办、官方服务、反诈咨询等联系人。
- 自由文本输入：规则意图识别将玩家输入归类为核实、打开链接、提交信息、举报、求助等行为。
- 动态叙事推进：`WorldState` 跟踪家庭信任链、同伴信任链、权威压力、截止压力、官方路径认知、可疑链接暴露和已提交信息量。
- 多视图模拟：消息、模拟浏览器、官方页面、电话、证据页。
- 应急阶段：提交敏感信息或模拟资金损失后进入应急处置。
- 复盘报告：评分、时间线、信任链分析、压力链摘要、延迟后果和现实建议。
- 安全过滤：真实链接和支付信息会被替换为模拟内容，浏览器输入框为只读。

## 技术栈

- Next.js 16 App Router
- React 19
- TypeScript
- Zustand
- Tailwind CSS

## 本地运行

```bash
npm install
npm run dev
```

访问：

```text
http://localhost:3000
```

调试面板：

```text
http://localhost:3000/?debug=1
```

## 常用命令

```bash
npm run lint
npm run build
```

当前验证状态：

- `npm run lint` 通过
- `npm run build` 通过

## 目录结构

```text
src/app/                 Next.js 页面与 Route Handlers
src/components/          UI 组件和各模拟屏幕
src/store/gameStore.ts   前端状态管理
src/lib/apiClient.ts     前端 API 封装
src/domain/chat/         意图识别与聊天编排
src/domain/agents/       各联系人 Agent
src/domain/narrative/    WorldState 与叙事阶段推进
src/domain/services/     游戏引擎、评分、报告、安全过滤
src/domain/repositories/ 会话与章节仓储
src/data/                固定剧情和玩家资料
docs/                    架构、AI 扩展、验收和维护文档
```

## 核心数据流

1. 前端通过 `useGameStore` 发起操作。
2. `apiClient` 调用 `/api/*` Route Handler。
3. API 读取 `GameSessionRepository` 中的会话状态。
4. 旧事件卡流程由 `GameEngine` 推进。
5. 聊天流程由 `ChatService` 调用 `IntentParser`、Agent 和 `NarrativeDirector`。
6. 状态写回仓储，前端刷新当前阶段和视图。
7. 结束时 `ReportService` 生成复盘报告。

## 安全边界

本项目只用于教育模拟：

- 链接使用 `game-simulated-link.local` 模拟域名。
- 页面表单为只读，不收集真实个人信息。
- `SafetyFilterService` 会替换真实链接和支付账号信息。
- `.env*`、`api_key.txt`、`*.key`、`*.secret`、`*.token` 已加入 `.gitignore`。

不要把真实 API key、真实身份证号、真实支付账号或真实诈骗素材提交到仓库。

## 当前限制

- 会话存储是进程内 `Map`，服务重启后会话丢失。
- Agent 当前是规则/Mock 实现，LLM 接入还在扩展设计阶段。
- README 和文档描述的是 MVP 结构，生产化还需要持久化、鉴权、日志和部署配置。
