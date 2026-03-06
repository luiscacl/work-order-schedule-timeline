import { Timescale } from '../models/timescale.model';

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function addUnit(d: Date, unit: 'hour'|'day'|'week'|'month', amount: number): Date {
  const out = new Date(d);
  if (unit === 'hour') out.setHours(out.getHours() + amount);
  else if (unit === 'day') out.setDate(out.getDate() + amount);
  else if (unit === 'week') out.setDate(out.getDate() + amount * 7);
  else out.setMonth(out.getMonth() + amount);
  return out;
}

export function diffUnits(from: Date, to: Date, unit: 'hour'|'day'|'week'|'month'): number {
  const ms = to.getTime() - from.getTime();

  if (unit === 'hour') return Math.floor(ms / (1000 * 60 * 60));
  if (unit === 'day') return Math.floor(ms / (1000 * 60 * 60 * 24));
  if (unit === 'week') return Math.floor(ms / (1000 * 60 * 60 * 24 * 7));

  return (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
}

export function formatHeaderLabel(d: Date, scale: Timescale): string {
  if (scale === 'hour') {
    const h = String(d.getHours()).padStart(2, '0');
    return `${h}:00`;
  }
  if (scale === 'day') {
    const month = d.toLocaleString('en-US', { month: 'short' });
    return `${month} ${d.getDate()}`;
  }
  if (scale === 'week') {
    return `Week ${getWeekNumber(d)}`;
  }
  return d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
}

export function startOfHour(d: Date): Date {
  const out = new Date(d);
  out.setMinutes(0, 0, 0);
  return out;
}

function getWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function startOfWeek(d: Date): Date {
  const day = startOfDay(d);
  const dayNum = (day.getDay() + 6) % 7;
  day.setDate(day.getDate() - dayNum);
  return day;
}

export function parseISODate(s: string): Date {
  if (s.includes('T')) {
    const d = new Date(s);
    return d;
  }
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}