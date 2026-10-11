"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, ClipboardList, CookingPot } from "lucide-react";
import type { AgendaEvent } from "@/lib/workspace/types";

const weekdayNames = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const monthFormatter = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });
const fullDateFormatter = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

function dateFromKey(key: string) {
  return new Date(`${key}T12:00:00Z`);
}

function dateKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function calendarDays(month: Date) {
  const year = month.getUTCFullYear();
  const monthIndex = month.getUTCMonth();
  const firstWeekday = (new Date(Date.UTC(year, monthIndex, 1)).getUTCDay() + 6) % 7;
  const totalDays = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const cells = Math.ceil((firstWeekday + totalDays) / 7) * 7;
  return Array.from({ length: cells }, (_, index) => {
    const date = new Date(Date.UTC(year, monthIndex, index - firstWeekday + 1));
    return { date, key: dateKey(date), inMonth: date.getUTCMonth() === monthIndex };
  });
}

export function AgendaCalendar({ events, todayKey }: { events: AgendaEvent[]; todayKey: string }) {
  const today = dateFromKey(todayKey);
  const [month, setMonth] = useState(() => new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)));
  const [selectedDay, setSelectedDay] = useState(todayKey);
  const monthKey = `${month.getUTCFullYear()}-${String(month.getUTCMonth() + 1).padStart(2, "0")}`;
  const eventsByDay = new Map<string, AgendaEvent[]>();
  events.forEach((event) => eventsByDay.set(event.date, [...(eventsByDay.get(event.date) ?? []), event]));
  const selectedEvents = eventsByDay.get(selectedDay) ?? [];
  const days = calendarDays(month);

  function moveMonth(delta: number) {
    const nextMonth = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + delta, 1));
    setMonth(nextMonth);
    setSelectedDay(dateKey(nextMonth));
  }

  return (
    <div className="agenda-calendar-layout">
      <section className="agenda-calendar-panel" aria-label="Calendário mensal">
        <div className="agenda-calendar-toolbar">
          <div className="agenda-month-title">
            <span className="agenda-calendar-icon"><CalendarDays size={19} aria-hidden="true" /></span>
            <h2>{monthFormatter.format(month)}</h2>
          </div>
          <div className="agenda-calendar-nav">
            <button type="button" onClick={() => moveMonth(-1)} aria-label="Mês anterior"><ChevronLeft size={18} /></button>
            <button type="button" onClick={() => { setMonth(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1))); setSelectedDay(todayKey); }}>Hoje</button>
            <button type="button" onClick={() => moveMonth(1)} aria-label="Próximo mês"><ChevronRight size={18} /></button>
          </div>
        </div>

        <div className="agenda-calendar-grid" role="grid" aria-label={monthFormatter.format(month)}>
          {weekdayNames.map((name) => <div className="agenda-weekday" key={name} role="columnheader">{name}</div>)}
          {days.map(({ date, key, inMonth }) => {
            const dayEvents = eventsByDay.get(key) ?? [];
            const isToday = key === todayKey;
            return (
              <button
                aria-current={isToday ? "date" : undefined}
                aria-label={`${fullDateFormatter.format(date)}${dayEvents.length ? `, ${dayEvents.length} compromisso(s)` : ", sem compromissos"}`}
                aria-selected={key === selectedDay}
                className={`agenda-day ${inMonth ? "" : "is-outside-month"} ${isToday ? "is-today" : ""} ${key === selectedDay ? "is-selected" : ""}`}
                key={key}
                onClick={() => setSelectedDay(key)}
                role="gridcell"
                type="button"
              >
                <span className="agenda-day-number">{date.getUTCDate()}</span>
                <span className="agenda-day-events">
                  {dayEvents.slice(0, 2).map((event) => <span className={`agenda-event-chip is-${event.kind}`} key={`${event.kind}-${event.id}`}>{event.title}</span>)}
                  {dayEvents.length > 2 && <span className="agenda-event-more">+{dayEvents.length - 2} mais</span>}
                </span>
                {dayEvents.length > 0 && <span className="agenda-event-dots" aria-hidden="true">{dayEvents.some((event) => event.kind === "order") && <i className="is-order" />}{dayEvents.some((event) => event.kind === "production") && <i className="is-production" />}</span>}
              </button>
            );
          })}
        </div>
        <div className="agenda-calendar-legend"><span><i className="is-order" />Pedidos</span><span><i className="is-production" />Produção</span></div>
      </section>

      <aside className="agenda-day-panel" aria-live="polite">
        <div className="agenda-day-panel-heading">
          <p className="eyebrow">Compromissos do dia</p>
          <h2>{fullDateFormatter.format(dateFromKey(selectedDay))}</h2>
          <span>{selectedEvents.length} {selectedEvents.length === 1 ? "compromisso" : "compromissos"}</span>
        </div>
        {selectedEvents.length ? (
          <div className="agenda-selected-events">
            {selectedEvents.map((event) => {
              const Icon = event.kind === "order" ? ClipboardList : CookingPot;
              return <article className={`agenda-selected-event is-${event.kind}`} key={`${event.kind}-${event.id}`}>
                <span className="agenda-selected-icon"><Icon size={17} aria-hidden="true" /></span>
                <div><strong>{event.title}</strong><span>{event.time} · {event.subtitle}</span><small>{event.status}</small></div>
                <Link href={event.kind === "order" ? "/orders" : "/production"} aria-label={`Abrir ${event.kind === "order" ? "pedidos" : "produção"}`}><ChevronRight size={17} /></Link>
              </article>;
            })}
          </div>
        ) : (
          <div className="agenda-day-empty"><span><CalendarDays size={22} aria-hidden="true" /></span><strong>Dia livre por aqui</strong><p>Não há pedidos ou produções marcados para esta data.</p></div>
        )}
        <div className="agenda-day-shortcuts"><Link href="/orders/new">+ Novo pedido</Link><Link href="/production/new">+ Planejar produção</Link></div>
      </aside>
      <span className="sr-only">Mês exibido: {monthKey}</span>
    </div>
  );
}
