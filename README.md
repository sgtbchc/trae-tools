# trae-tools

围绕 Trae ID 构建的 Windows 灵动岛应用，提供类似苹果灵动岛的视觉体验与交互能力，实时展示 Trae IDE 任务状态、Token 生成速度，并支持审批/取消等快捷操作。

## 项目结构

```
trae-tools/
├── dynamic-island/                  # 灵动岛应用 (Tauri 2.0 + React)
│   ├── index.html                   # 前端入口 HTML
│   ├── package.json                 # Node.js 依赖配置
│   ├── tsconfig.json                # TypeScript 配置
│   ├── vite.config.ts               # Vite 构建配置
│   ├── server/
│   │   └── index.ts                 # Mock 服务端 (WebSocket + HTTP，模拟 Trae IDE)
│   ├── src-tauri/
│   │   ├── Cargo.toml               # Rust 依赖配置
│   │   ├── build.rs                 # Tauri 构建脚本
│   │   ├── tauri.conf.json          # Tauri 窗口与应用配置
│   │   └── src/
│   │       ├── main.rs              # Rust 入口
│   │       └── lib.rs               # Tauri 命令 (多显示器/DPI/窗口管理)
│   └── src/
│       ├── main.tsx                 # React 入口
│       ├── App.tsx                  # 主应用组件 (状态管理 + 集成)
│       ├── types/index.ts           # TypeScript 类型定义
│       ├── styles/global.css        # 全局样式 + CSS 变量
│       ├── components/
│       │   ├── CompactState.tsx     # 紧凑态 (药丸形状)
│       │   ├── ExpandedState.tsx    # 展开态 (任务详情 + 操作)
│       │   ├── FullState.tsx        # 全展开态 (任务列表)
│       │   └── ActionFeedback.tsx   # 操作反馈动画
│       ├── hooks/
│       │   ├── useIslandStore.ts    # 灵动岛状态管理
│       │   └── useMonitorPosition.ts # 多显示器定位
│       └── services/
│           ├── wsClient.ts          # WebSocket 客户端 + 自动重连
│           ├── apiClient.ts         # HTTP API 客户端
│           └── actionQueue.ts       # 离线操作队列
└── openspec/                        # OpenSpec 设计文档
    └── changes/trae-plugin-dynamic-island/
        ├── proposal.md              # 变更提案 (Why & What)
        ├── design.md                # 技术设计 (How)
        ├── specs/                   # 功能规格 (5 个能力模块)
        └── tasks.md                 # 实施任务清单
```

## 功能特性

- **三态灵动岛 UI**：紧凑态（药丸）→ 展开态（详情）→ 全展开态（任务列表），Spring 动画过渡
- **实时任务状态**：等待中/处理中/已完成/失败/待审批，颜色编码 + 状态指示灯
- **Token 速度监控**：实时 tokens/s 计数 + 60 秒 Sparkline 迷你图表
- **快捷交互**：审批/拒绝按钮、任务取消（带确认弹窗）、点击跳转到 Trae 窗口
- **操作反馈**：成功 ✓ / 失败 ✕ 动画提示（1.5 秒）
- **多显示器支持**：自动检测显示器，居中定位，Per-Monitor DPI 感知
- **离线队列**：断连时操作自动排队，重连后自动执行
- **自动重连**：3 秒初始间隔，指数退避（最大 30 秒）

## 版本依赖

| 依赖 | 版本要求 | 说明 |
|------|----------|------|
| **Rust** | >= 1.77 | Tauri 2.0 后端编译 |
| **Node.js** | >= 18 | 前端开发与构建 |
| **pnpm** | >= 8 | 包管理器 |
| **Tauri CLI** | 2.x | `@tauri-apps/cli` |
| **Tauri API** | 2.x | `@tauri-apps/api` |
| **React** | 18.x | UI 框架 |
| **Framer Motion** | 11.x | 动画库 |
| **WebView2** | 系统内置 | Windows 10/11 自带，Tauri 在 Windows 上使用 WebView2 渲染 |

## Windows 构建指南

### 1. 安装前置依赖

**安装 Rust：**
```powershell
# 访问 https://rustup.rs 下载并运行 rustup-init.exe
# 或使用 winget:
winget install Rustlang.Rustup
```

**安装 Node.js：**
```powershell
# 推荐使用 fnm 或 nvm-windows 管理版本
winget install Schniz.fnm
fnm install 20
fnm use 20
```

**安装 pnpm：**
```powershell
npm install -g pnpm
```

**确认 WebView2：**
Windows 10 (1803+) 和 Windows 11 已内置 WebView2，无需额外安装。如缺失，从 https://developer.microsoft.com/en-us/microsoft-edge/webview2/ 下载。

### 2. 克隆项目并安装依赖

```powershell
git clone https://github.com/sgtbchc/trae-tools.git
cd trae-tools/dynamic-island
pnpm install
```

### 3. 开发模式

**启动 Mock 服务端（模拟 Trae IDE 数据）：**
```powershell
pnpm server
# Mock server running on http://localhost:18731 (HTTP + WebSocket)
```

**启动 Tauri 开发模式（新终端窗口）：**
```powershell
pnpm tauri dev
```

此命令会同时启动 Vite 前端开发服务器和 Tauri Rust 后端，支持热重载。

### 4. 生产构建

```powershell
pnpm tauri build
```

构建产物位于 `src-tauri/target/release/bundle/`：
- `msi/` - Windows MSI 安装包
- `nsis/` - NSIS 安装包

### 5. 仅前端开发（无需 Rust）

如果只想调试前端 UI，可以跳过 Tauri 直接用 Vite：

```powershell
# 终端 1：启动 Mock 服务端
pnpm server

# 终端 2：启动 Vite 开发服务器
pnpm dev
# 浏览器访问 http://localhost:1420
```

> 注意：纯前端模式下，Tauri 特有功能（窗口置顶、透明、无边框、多显示器定位）不可用，但 UI 交互和通信逻辑可正常调试。

## 通信协议

灵动岛与 Trae IDE 通过本地 WebSocket + HTTP 通信：

**WebSocket (ws://localhost:18731)：**
- 实时任务状态推送 (`task:status-changed`)
- Token 速度推送 (`task:token-speed`)
- 审批请求推送 (`task:approval-required`)
- 心跳保活 (`ping` / `pong`)

**HTTP API (http://localhost:18731/api)：**
- `GET /api/tasks` - 查询当前任务列表
- `POST /api/tasks/:id/action` - 执行任务操作 (`cancel` / `approve` / `reject`)

**消息格式 (JSON Envelope)：**
```json
{
  "type": "task:status-changed",
  "payload": { ... },
  "timestamp": "2026-04-26T12:00:00.000Z",
  "requestId": "optional-correlation-id"
}
```

## 灵动岛状态流转

```
┌──────────┐  hover/有任务  ┌──────────┐  click  ┌──────────┐
│ Compact  │──────────────▶│ Expanded │───────▶│   Full   │
│ (药丸)   │◀──────────────│ (详情)   │◀───────│ (列表)   │
└──────────┘  mouse leave  └──────────┘  click  └──────────┘
     │                                              │
     └──────────── click (无任务时) ────────────────┘
```

## License

MIT
