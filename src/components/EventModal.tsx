import { useState, useEffect } from "react";
import dayjs from "dayjs";
import {
  CalendarEvent,
  EventFormData,
  EVENT_COLORS,
  REMINDER_OPTIONS,
} from "../types";

interface Props {
  event?: CalendarEvent | null;
  initialDate?: string;
  onSave: (data: Omit<CalendarEvent, "id"> | CalendarEvent) => void;
  onDelete?: (id: number) => void;
  onClose: () => void;
}

const toDatetimeLocal = (iso: string) =>
  dayjs(iso).format("YYYY-MM-DDTHH:mm");

const fromDatetimeLocal = (local: string) =>
  dayjs(local).toISOString();

export default function EventModal({
  event,
  initialDate,
  onSave,
  onDelete,
  onClose,
}: Props) {
  const now = initialDate
    ? dayjs(initialDate)
    : dayjs().startOf("hour").add(1, "hour");

  const [form, setForm] = useState<EventFormData>({
    title: event?.title ?? "",
    start_time: event
      ? toDatetimeLocal(event.start_time)
      : now.format("YYYY-MM-DDTHH:mm"),
    end_time: event
      ? toDatetimeLocal(event.end_time)
      : now.add(1, "hour").format("YYYY-MM-DDTHH:mm"),
    description: event?.description ?? "",
    color: event?.color ?? "#3b82f6",
    reminder_minutes: event?.reminder_minutes ?? 15,
    all_day: event ? Boolean(event.all_day) : false,
  });

  const [error, setError] = useState("");

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("标题不能为空");
      return;
    }
    if (!form.all_day && form.start_time >= form.end_time) {
      setError("结束时间必须晚于开始时间");
      return;
    }

    const data = {
      title: form.title.trim(),
      start_time: fromDatetimeLocal(form.start_time),
      end_time: form.all_day
        ? dayjs(form.start_time).endOf("day").toISOString()
        : fromDatetimeLocal(form.end_time),
      description: form.description,
      color: form.color,
      reminder_minutes: form.reminder_minutes,
      all_day: form.all_day ? 1 : 0,
    };

    if (event) {
      onSave({ ...data, id: event.id });
    } else {
      onSave(data);
    }
    onClose();
  };

  const field = (key: keyof EventFormData, value: string | number | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-2xl w-[480px] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {event ? "编辑事件" : "新建事件"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Title */}
          <div>
            <input
              type="text"
              placeholder="事件标题"
              value={form.title}
              onChange={(e) => field("title", e.target.value)}
              className="w-full text-lg font-medium border-0 border-b-2 border-gray-200 focus:border-blue-500 outline-none pb-1 placeholder-gray-400"
              autoFocus
            />
          </div>

          {/* All day toggle */}
          <div className="flex items-center gap-2">
            <input
              id="all_day"
              type="checkbox"
              checked={form.all_day}
              onChange={(e) => field("all_day", e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <label htmlFor="all_day" className="text-sm text-gray-600">
              全天事件
            </label>
          </div>

          {/* Time */}
          {!form.all_day && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">开始</label>
                <input
                  type="datetime-local"
                  value={form.start_time}
                  onChange={(e) => field("start_time", e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">结束</label>
                <input
                  type="datetime-local"
                  value={form.end_time}
                  onChange={(e) => field("end_time", e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {form.all_day && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">日期</label>
              <input
                type="date"
                value={form.start_time.slice(0, 10)}
                onChange={(e) =>
                  field("start_time", e.target.value + "T00:00")
                }
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <textarea
              placeholder="添加备注..."
              value={form.description}
              onChange={(e) => field("description", e.target.value)}
              rows={2}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs text-gray-500 mb-2">颜色</label>
            <div className="flex gap-2 flex-wrap">
              {EVENT_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => field("color", c.value)}
                  className="w-7 h-7 rounded-full transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c.value,
                    outline:
                      form.color === c.value ? `3px solid ${c.value}` : "none",
                    outlineOffset: "2px",
                  }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Reminder */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">提醒</label>
            <select
              value={form.reminder_minutes}
              onChange={(e) =>
                field("reminder_minutes", Number(e.target.value))
              }
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {REMINDER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-2 border-t border-gray-100">
            {event && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(event.id);
                  onClose();
                }}
                className="text-sm text-red-500 hover:text-red-700"
              >
                删除事件
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="text-sm px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                取消
              </button>
              <button
                type="submit"
                className="text-sm px-4 py-2 rounded-lg text-white font-medium"
                style={{ backgroundColor: form.color }}
              >
                保存
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
