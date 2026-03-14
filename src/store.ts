import { create } from "zustand";
import { CalendarEvent } from "./types";
import * as db from "./db";

interface CalendarStore {
  events: CalendarEvent[];
  loading: boolean;
  loadEvents: (start: string, end: string) => Promise<void>;
  addEvent: (data: Omit<CalendarEvent, "id">) => Promise<void>;
  editEvent: (event: CalendarEvent) => Promise<void>;
  removeEvent: (id: number) => Promise<void>;
}

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  events: [],
  loading: false,

  loadEvents: async (start, end) => {
    set({ loading: true });
    const events = await db.fetchEventsByRange(start, end);
    set({ events, loading: false });
  },

  addEvent: async (data) => {
    const id = await db.createEvent(data);
    const newEvent: CalendarEvent = { ...data, id };
    set({ events: [...get().events, newEvent] });
  },

  editEvent: async (event) => {
    await db.updateEvent(event);
    set({
      events: get().events.map((e) => (e.id === event.id ? event : e)),
    });
  },

  removeEvent: async (id) => {
    await db.deleteEvent(id);
    set({ events: get().events.filter((e) => e.id !== id) });
  },
}));
