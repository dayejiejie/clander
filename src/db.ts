import Database from "@tauri-apps/plugin-sql";
import { CalendarEvent } from "./types";

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (db) return db;
  db = await Database.load("sqlite:clander.db");
  await db.execute(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      description TEXT DEFAULT '',
      color TEXT DEFAULT '#3b82f6',
      reminder_minutes INTEGER DEFAULT 15,
      all_day INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
  return db;
}

export async function fetchEventsByRange(
  start: string,
  end: string
): Promise<CalendarEvent[]> {
  const db = await getDb();
  return await db.select<CalendarEvent[]>(
    "SELECT * FROM events WHERE start_time < ? AND end_time > ? ORDER BY start_time",
    [end, start]
  );
}

export async function createEvent(
  data: Omit<CalendarEvent, "id">
): Promise<number> {
  const db = await getDb();
  const result = await db.execute(
    `INSERT INTO events (title, start_time, end_time, description, color, reminder_minutes, all_day)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.title,
      data.start_time,
      data.end_time,
      data.description,
      data.color,
      data.reminder_minutes,
      data.all_day,
    ]
  );
  return result.lastInsertId ?? 0;
}

export async function updateEvent(event: CalendarEvent): Promise<void> {
  const db = await getDb();
  await db.execute(
    `UPDATE events SET title=?, start_time=?, end_time=?, description=?, color=?, reminder_minutes=?, all_day=?,
     updated_at=datetime('now') WHERE id=?`,
    [
      event.title,
      event.start_time,
      event.end_time,
      event.description,
      event.color,
      event.reminder_minutes,
      event.all_day,
      event.id,
    ]
  );
}

export async function deleteEvent(id: number): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM events WHERE id=?", [id]);
}

export async function fetchUpcomingReminders(): Promise<CalendarEvent[]> {
  const db = await getDb();
  const now = new Date().toISOString();
  const soon = new Date(Date.now() + 2 * 60 * 1000).toISOString(); // next 2 minutes
  return await db.select<CalendarEvent[]>(
    `SELECT * FROM events WHERE reminder_minutes > 0
     AND datetime(start_time, '-' || reminder_minutes || ' minutes') BETWEEN ? AND ?`,
    [now, soon]
  );
}
