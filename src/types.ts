export interface CalendarEvent {
  id: number;
  title: string;
  start_time: string; // ISO 8601
  end_time: string;   // ISO 8601
  description: string;
  color: string;
  reminder_minutes: number;
  all_day: number; // 0 or 1 (SQLite boolean)
}

export interface EventFormData {
  title: string;
  start_time: string;
  end_time: string;
  description: string;
  color: string;
  reminder_minutes: number;
  all_day: boolean;
}

export const EVENT_COLORS = [
  { label: "蓝色", value: "#3b82f6" },
  { label: "绿色", value: "#22c55e" },
  { label: "红色", value: "#ef4444" },
  { label: "紫色", value: "#a855f7" },
  { label: "橙色", value: "#f97316" },
  { label: "粉色", value: "#ec4899" },
  { label: "青色", value: "#06b6d4" },
  { label: "灰色", value: "#6b7280" },
];

export const REMINDER_OPTIONS = [
  { label: "无提醒", value: 0 },
  { label: "5 分钟前", value: 5 },
  { label: "15 分钟前", value: 15 },
  { label: "30 分钟前", value: 30 },
  { label: "1 小时前", value: 60 },
  { label: "1 天前", value: 1440 },
];
