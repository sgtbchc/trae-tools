## 1. Project Scaffolding

- [x] 1.1 Initialize Tauri 2.0 + React project in /code/opensource/trae_tool/dynamic-island
- [x] 1.2 Configure TypeScript, Vite, and project tooling
- [x] 1.3 Set up shared types (TaskStatus, TraeTask, WsMessage, IslandState, etc.)
- [x] 1.4 Configure Tauri window: frameless, transparent, always-on-top, skip-taskbar

## 2. Mock Server (Trae IDE Side Simulation)

- [x] 2.1 Implement WebSocket + HTTP server sharing port 18731
- [x] 2.2 Implement /api/tasks endpoint with Trae ID token auth
- [x] 2.3 Implement /api/tasks/:id/action endpoint (cancel, approve, reject)
- [x] 2.4 Implement WebSocket message protocol (JSON envelope, auth, ping/pong)
- [x] 2.5 Implement mock task data with status transitions and token speed simulation

## 3. Dynamic Island - Core Window & UI

- [x] 3.1 Implement Tauri window configuration: frameless, transparent, always-on-top, click-through
- [x] 3.2 Implement Dynamic Island positioning: top-center of each monitor, multi-monitor detection and per-monitor window creation
- [x] 3.3 Implement per-monitor DPI awareness: detect DPI scaling, render at correct physical size
- [x] 3.4 Implement compact pill state: status icon, 200x36px, dark semi-transparent background, 20px border radius
- [x] 3.5 Implement expanded state: smooth 300ms spring animation, task details and token speed display
- [x] 3.6 Implement full expanded state: 400x200px, all information and interaction controls
- [x] 3.7 Implement state transition animations: compact↔expanded↔full, content fade transitions (200ms)
- [x] 3.8 Implement dark theme with status color coding: waiting=amber, processing=blue, completed=green, failed=red, approval-pending=purple

## 4. Dynamic Island - Data Connection

- [x] 4.1 Implement WebSocket client: connect to Trae IDE server, Trae ID token authentication
- [x] 4.2 Implement automatic reconnection: 3-second initial interval, exponential backoff (max 30s), disconnected status indicator
- [x] 4.3 Implement message deserialization and dispatch: parse JSON envelope, route to appropriate UI handlers
- [x] 4.4 Implement HTTP client for simple operations: task status query, task action (cancel, approve)
- [x] 4.5 Implement offline action queuing: queue actions when disconnected, execute on reconnection, pending indicator

## 5. Dynamic Island - Interaction Features

- [x] 5.1 Implement real-time task status display: status icon/color/text, update within 2 seconds, multiple task count badge and cycling
- [x] 5.2 Implement token generation speed display: tokens/second counter (5-second rolling average), mini sparkline chart in expanded view
- [x] 5.3 Implement approval interaction: purple indicator for approval-pending, Approve/Reject buttons, send action to Trae IDE
- [x] 5.4 Implement task cancellation: cancel button in expanded view, confirmation prompt, cancel command to Trae IDE
- [x] 5.5 Implement click-to-jump: click task to send focus event to Trae IDE via WebSocket
- [x] 5.6 Implement action feedback: success/error indicator (checkmark/X, 1.5s)

## 6. Integration Testing & Polish

- [ ] 6.1 Write integration tests for Dynamic Island communication: WebSocket connect/reconnect, HTTP API, message protocol
- [ ] 6.2 Test multi-monitor scenarios: different DPI, monitor connect/disconnect, primary monitor selection
- [ ] 6.3 Test Dynamic Island with fullscreen applications: Z-order management, visibility, click-through
- [ ] 6.4 Performance optimization: ensure Dynamic Island rendering < 16ms frame time, WebSocket message latency < 100ms
