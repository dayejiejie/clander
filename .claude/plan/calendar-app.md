# Clander - 桌面日历应用实施计划

## 技术栈
- **框架**: Tauri 2.x + React 18 + TypeScript
- **UI 库**: FullCalendar (daygrid + timegrid + interaction)
- **状态管理**: Zustand
- **样式**: Tailwind CSS
- **数据库**: SQLite (tauri-plugin-sql)
- **通知**: tauri-plugin-notification

## 功能范围
- 月/周/日三种日历视图切换
- 事件 CRUD（标题、时间、描述、颜色标签）
- 自定义提醒时间（系统通知）

## 实施阶段

### Phase 1：项目初始化
- [ ] create-tauri-app 脚手架（React + TypeScript 模板）
- [ ] 安装 FullCalendar, Zustand, Tailwind CSS
- [ ] 配置 tauri-plugin-sql + tauri-plugin-notification

### Phase 2：数据库层
- [ ] SQLite migration（events 表）
- [ ] Tauri Commands: get_events_by_range, create_event, update_event, delete_event
- [ ] Event TypeScript 类型定义

### Phase 3：前端核心
- [ ] Zustand store（events CRUD）
- [ ] CalendarView 主容器（FullCalendar 集成）
- [ ] EventModal 弹窗（创建/编辑）

### Phase 4：提醒系统
- [ ] Tauri 后台定时任务（每分钟扫描）
- [ ] 系统通知触发

### Phase 5：UI 打磨
- [ ] Tailwind 全局主题
- [ ] 工具栏组件

## 数据模型

```sql
CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  start_time TEXT NOT NULL,  -- ISO 8601
  end_time TEXT NOT NULL,    -- ISO 8601
  description TEXT DEFAULT '',
  color TEXT DEFAULT '#3B82F6',
  reminder_minutes INTEGER DEFAULT 15,
  all_day INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
```
