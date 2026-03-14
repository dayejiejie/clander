# Clander 📅

一个用 Tauri + React 构建的跨平台桌面日历应用，支持 macOS 和 Windows。

---

## 功能

- 月 / 周 / 日 三种视图切换
- 创建、编辑、删除日历事件
- 事件颜色标签
- 自定义提醒时间（系统通知）
- 事件拖拽移动
- 数据本地存储（SQLite）

---

## 整体架构

```
┌─────────────────────────────────────────┐
│           前端（你看到的界面）              │
│   React + FullCalendar + Zustand        │
│                                         │
│   用户点击 → 组件更新 → 调用数据库操作      │
├─────────────────────────────────────────┤
│           Tauri 桥接层                   │
│   把网页应用包装成桌面应用                  │
│   提供文件系统、系统通知等系统能力           │
├─────────────────────────────────────────┤
│           本地数据库（SQLite）             │
│   存储所有日历事件数据                      │
│   文件保存在用户电脑本地                    │
└─────────────────────────────────────────┘
```

**简单理解：** Tauri 就像一个"壳"，把网页（React）装进去，让它能像普通桌面软件一样运行，同时能访问电脑的系统功能（通知、文件等）。

---

## 项目文件结构

```
clander/
│
├── src/                        # 前端代码（React）
│   ├── main.tsx                # 程序入口，启动 React
│   ├── App.tsx                 # 根组件，负责提醒通知的定时检查
│   ├── types.ts                # 数据类型定义
│   ├── db.ts                   # 数据库操作（增删改查）
│   ├── store.ts                # 全局状态管理
│   ├── index.css               # 全局样式
│   └── components/
│       ├── CalendarView.tsx    # 日历主视图
│       └── EventModal.tsx      # 新建/编辑事件的弹窗
│
├── src-tauri/                  # 后端代码（Rust）
│   ├── src/
│   │   ├── main.rs             # 程序启动入口
│   │   └── lib.rs              # 插件注册（数据库、通知）
│   ├── Cargo.toml              # Rust 依赖配置（类似 package.json）
│   ├── tauri.conf.json         # 应用配置（窗口大小、应用名称等）
│   └── icons/                  # 应用图标
│
├── .github/
│   └── workflows/
│       └── build.yml           # 自动打包配置（macOS + Windows）
│
├── package.json                # 前端依赖配置
└── vite.config.ts              # 前端构建工具配置
```

---

## 核心文件详解

### `src/types.ts` — 数据结构定义

定义了"事件"长什么样：

```typescript
interface CalendarEvent {
  id: number;          // 唯一编号（数据库自动生成）
  title: string;       // 事件标题
  start_time: string;  // 开始时间（ISO 格式，如 2024-03-14T10:00:00Z）
  end_time: string;    // 结束时间
  description: string; // 备注
  color: string;       // 颜色（十六进制，如 #3b82f6）
  reminder_minutes: number; // 提前多少分钟提醒
  all_day: number;     // 是否全天事件（1=是，0=否）
}
```

---

### `src/db.ts` — 数据库操作

负责和 SQLite 数据库打交道。数据库第一次运行时自动创建表：

```sql
CREATE TABLE events (
  id          自动编号,
  title       标题,
  start_time  开始时间,
  end_time    结束时间,
  description 备注,
  color       颜色,
  reminder_minutes 提醒时间,
  all_day     是否全天
)
```

提供以下操作：
- `fetchEventsByRange(start, end)` — 查询某个时间范围内的事件（切换视图时用）
- `createEvent(data)` — 新建事件
- `updateEvent(event)` — 修改事件
- `deleteEvent(id)` — 删除事件
- `fetchUpcomingReminders()` — 查询接下来 2 分钟内需要提醒的事件

---

### `src/store.ts` — 全局状态管理

用 **Zustand** 管理"当前显示哪些事件"这个状态。

**为什么需要状态管理？**
React 里每个组件都有自己的数据，但日历视图和弹窗需要共享同一份事件数据。Zustand 就像一个"公共仓库"，所有组件都从这里读取和更新数据。

**乐观更新**：用户点击"保存"后，界面立刻更新（不等数据库写完），体验更流畅。

---

### `src/components/CalendarView.tsx` — 日历视图

核心是 **FullCalendar** 这个日历库，它帮我们处理了所有复杂的日历渲染逻辑。

关键交互：
| 用户操作 | 触发什么 |
|---------|---------|
| 切换月/周/日视图 | `datesSet` → 重新从数据库加载该范围的事件 |
| 点击空白日期 | `dateClick` → 打开新建弹窗，预填日期 |
| 点击已有事件 | `eventClick` → 打开编辑弹窗 |
| 拖拽事件 | `eventDrop` → 计算时间差，更新数据库 |

---

### `src/components/EventModal.tsx` — 事件弹窗

新建和编辑共用同一个弹窗组件：
- 传入 `event` 参数 → 编辑模式（底部显示"删除"按钮）
- 不传 `event` 参数 → 新建模式

---

### `src/App.tsx` — 提醒系统

每 60 秒运行一次检查：

```
每分钟 → 查数据库 → 找"现在到2分钟后"之间应该提醒的事件 → 发系统通知
```

**局限**：窗口关闭后提醒停止。未来可以改成系统托盘常驻后台。

---

### `src-tauri/src/lib.rs` — Rust 后端

注册了三个插件：
- `tauri-plugin-sql` — 提供 SQLite 数据库能力
- `tauri-plugin-notification` — 提供系统通知能力
- `tauri-plugin-opener` — 提供打开链接/文件能力

---

### `.github/workflows/build.yml` — 自动打包

推送版本 tag（如 `v1.0.0`）后，GitHub 自动在云服务器上：
1. 安装 Rust 和 Node.js 环境
2. 编译前端代码
3. 编译 Rust 后端代码
4. 打包成 `.dmg`（macOS）和 `.exe/.msi`（Windows）
5. 上传到 GitHub Releases 供下载

三个平台**同时并行**编译，互不干扰。

---

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发模式（有热更新，改代码自动刷新）
npm run tauri dev

# 打包正式版
npm run tauri build
```

**注意**：需要先安装 Rust（`rustup`）和 Node.js。

---

## 技术选型说明

| 技术 | 选择原因 |
|------|---------|
| **Tauri** | 比 Electron 包体小 10 倍（4.7MB vs ~150MB），性能更好 |
| **React** | 最流行的前端框架，生态成熟 |
| **TypeScript** | 给 JavaScript 加上类型检查，减少 bug |
| **FullCalendar** | 功能完整的日历库，拖拽、多视图开箱即用 |
| **Zustand** | 比 Redux 简单很多的状态管理，适合中小型应用 |
| **SQLite** | 轻量级数据库，数据存在本地文件，不需要服务器 |
| **Tailwind CSS** | 用工具类直接写样式，不需要单独写 CSS 文件 |
