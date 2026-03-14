import { useRef, useState, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import { EventClickArg, DatesSetArg, EventDropArg } from "@fullcalendar/core";
import { useCalendarStore } from "../store";
import { CalendarEvent } from "../types";
import EventModal from "./EventModal";
import dayjs from "dayjs";

export default function CalendarView() {
  const { events, loadEvents, addEvent, editEvent, removeEvent } =
    useCalendarStore();
  const calendarRef = useRef<FullCalendar>(null);

  const [modal, setModal] = useState<{
    mode: "create" | "edit";
    event?: CalendarEvent;
    initialDate?: string;
  } | null>(null);

  const handleDatesSet = useCallback(
    ({ startStr, endStr }: DatesSetArg) => {
      loadEvents(startStr, endStr);
    },
    [loadEvents]
  );

  const handleDateClick = useCallback((arg: DateClickArg) => {
    setModal({ mode: "create", initialDate: arg.dateStr });
  }, []);

  const handleEventClick = useCallback(
    (arg: EventClickArg) => {
      const id = Number(arg.event.id);
      const ev = events.find((e) => e.id === id);
      if (ev) setModal({ mode: "edit", event: ev });
    },
    [events]
  );

  const handleEventDrop = useCallback(
    (arg: EventDropArg) => {
      const id = Number(arg.event.id);
      const ev = events.find((e) => e.id === id);
      if (!ev) return;
      const delta = arg.delta;
      const updated: CalendarEvent = {
        ...ev,
        start_time: dayjs(ev.start_time)
          .add(delta.milliseconds, "ms")
          .add(delta.days, "day")
          .add(delta.months, "month")
          .toISOString(),
        end_time: dayjs(ev.end_time)
          .add(delta.milliseconds, "ms")
          .add(delta.days, "day")
          .add(delta.months, "month")
          .toISOString(),
      };
      editEvent(updated);
    },
    [events, editEvent]
  );

  const fcEvents = events.map((e) => ({
    id: String(e.id),
    title: e.title,
    start: e.start_time,
    end: e.end_time,
    backgroundColor: e.color,
    borderColor: e.color,
    allDay: Boolean(e.all_day),
  }));

  return (
    <div className="h-full p-4">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        buttonText={{
          today: "今天",
          month: "月",
          week: "周",
          day: "日",
        }}
        locale="zh-cn"
        firstDay={1}
        height="100%"
        events={fcEvents}
        editable={true}
        selectable={true}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        datesSet={handleDatesSet}
        nowIndicator={true}
        eventTimeFormat={{
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }}
      />

      {modal && (
        <EventModal
          event={modal.event}
          initialDate={modal.initialDate}
          onSave={(data) => {
            if ("id" in data) {
              editEvent(data as CalendarEvent);
            } else {
              addEvent(data as Omit<CalendarEvent, "id">);
            }
          }}
          onDelete={removeEvent}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
