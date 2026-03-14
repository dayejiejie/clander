import { useEffect } from "react";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";
import { fetchUpcomingReminders } from "./db";
import CalendarView from "./components/CalendarView";
import "./index.css";

async function setupNotifications() {
  let granted = await isPermissionGranted();
  if (!granted) {
    const perm = await requestPermission();
    granted = perm === "granted";
  }
  return granted;
}

async function checkReminders() {
  try {
    const events = await fetchUpcomingReminders();
    for (const ev of events) {
      await sendNotification({
        title: `⏰ ${ev.title}`,
        body: ev.description || "即将开始",
      });
    }
  } catch {
    // Notifications not critical — silently ignore
  }
}

export default function App() {
  useEffect(() => {
    setupNotifications();
    checkReminders();
    const interval = setInterval(checkReminders, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Titlebar */}
      <header className="flex items-center px-5 py-3 bg-white border-b border-gray-200 select-none">
        <div className="flex items-center gap-2">
          <span className="text-xl">📅</span>
          <span className="text-base font-semibold text-gray-800">Clander</span>
        </div>
      </header>

      {/* Calendar */}
      <main className="flex-1 overflow-hidden">
        <CalendarView />
      </main>
    </div>
  );
}
