export type Timescale = 'hour' | 'day' | 'week' | 'month';

export const TIMESCALE_LABEL: Record<Timescale, string> = {
  hour: 'Hour',
  day: 'Day',
  week: 'Week',
  month: 'Month',
};