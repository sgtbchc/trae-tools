## Why

Trae IDE 用户在使用 AI 对话编程时，缺乏对 token 消耗的实时感知和 API 额度的可视化管理，同时无法在不切换窗口的情况下了解当前任务执行状态。需要一个围绕 Trae ID 构建的插件系统来提供 token 统计、API 额度管理能力，以及一个 Windows 灵动岛应用来实现任务状态的实时展示与快捷交互，提升用户对 AI 编程过程的掌控力和使用体验。

## What Changes

- 新增 Token 统计插件：实时追踪对话过程中的输入/输出 token 消耗，支持累计计算与历史记录查询（按时间范围筛选）
- 新增 API 额度管理插件：通过配置 API Key 查询火山 Coding Plan 平台的额度信息，展示 5 小时/一周/一个月三种时间维度的额度使用情况，预留多平台扩展接口
- 新增 Windows 灵动岛应用：仿苹果灵动岛视觉效果，固定于显示器顶端，实时展示 Trae 任务状态、token 生成速度、审批状态，支持弹窗交互与跳转到 Trae 主窗口
- 新增 Trae ID 集成层：统一管理插件与灵动岛的身份认证与数据通道，确保所有功能与 Trae ID 系统兼容

## Capabilities

### New Capabilities
- `token-tracker`: 对话过程中 token 消耗的实时统计、累计计算与历史记录查询
- `api-quota-manager`: API 额度查询与管理，支持火山 Coding Plan 平台，预留多平台扩展接口
- `trae-id-integration`: Trae ID 身份认证与数据通道的统一集成层，为插件和灵动岛提供身份与通信基础
- `dynamic-island-ui`: Windows 灵动岛的视觉渲染、动画效果与多显示器适配
- `dynamic-island-interaction`: 灵动岛的交互逻辑，包括任务状态展示、弹窗操作、跳转到 Trae 窗口、快捷操作按钮

### Modified Capabilities

## Impact

- 新增 TypeScript/Node.js 插件系统代码，需引入插件生命周期管理框架
- 灵动岛应用使用 Tauri 2.0 + React 构建，Rust 后端处理系统级 API 调用
- 需要与 Trae IDE 的扩展 API 对接，获取对话 token 数据和任务状态信息
- 火山 Coding Plan API 集成，API Key 存储在本地配置文件中
- 灵动岛窗口需调用 Windows 系统 API 实现置顶、透明、无边框等效果
- 多显示器支持需依赖屏幕信息检测 API
- 所有数据存储使用本地 JSON 文件（~/.trae-tool/ 目录），零外部依赖
