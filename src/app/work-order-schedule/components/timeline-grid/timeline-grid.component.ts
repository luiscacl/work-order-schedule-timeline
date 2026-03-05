import { ChangeDetectionStrategy, Component, Input, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Timescale } from '../../../core/models/timescale.model';
import { WorkCenter } from '../../../core/models/work-center.model';
import { addUnit, diffUnits, formatHeaderLabel, startOfDay, startOfHour, startOfMonth, startOfWeek } from '../../../core/utils/date.utils';

type GridUnit = { key: string; label: string; date: Date };

@Component({
  selector: 'app-timeline-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timeline-grid.component.html',
  styleUrl: './timeline-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineGridComponent {
  @Input({ required: true }) timescale!: Timescale;
  @Input({ required: true }) workCenters!: WorkCenter[];
    @ViewChild('scrollEl') scrollEl?: ElementRef<HTMLDivElement>;


  hoveredId: string | null = null;

  readonly leftColWidth = 280;
  readonly rowHeight = 52;
  readonly headerHeight = 44;

  readonly unitWidth: Record<Timescale, number> = {
    hour: 114,
    day: 114,
    week: 114,
    month: 114,
  };

  ngAfterViewInit(): void {
    this.centerOnCurrent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['timescale'] && !changes['timescale'].firstChange) {
      this.centerOnCurrent();
    }
    if (changes['workCenters'] && !changes['workCenters'].firstChange) {
      this.centerOnCurrent();
    }
  }

  private centerOnCurrent(): void {
    requestAnimationFrame(() => {
      const el = this.scrollEl?.nativeElement;
      if (!el) return;

      const viewportW = el.clientWidth;
      const contentW = el.scrollWidth;

      const targetCenter = this.currentPeriodLeftPx;
      const desiredScrollLeft = targetCenter - viewportW / 2;

      const maxScrollLeft = Math.max(0, contentW - viewportW);
      el.scrollTo({ left: Math.min(Math.max(0, desiredScrollLeft), maxScrollLeft), behavior: 'smooth' });    
    });
  }

  get visibleStart(): Date {
    const now = new Date();
    const anchor =
      this.timescale === 'hour' ? startOfHour(now) :
      this.timescale === 'day'  ? startOfDay(now)  :
      this.timescale === 'week' ? startOfWeek(now) :

  startOfMonth(now);
    if (this.timescale === 'hour') return addUnit(anchor, 'hour', -24);
    if (this.timescale === 'day')  return addUnit(anchor, 'day', -14);
    if (this.timescale === 'week') return addUnit(anchor, 'week', -8);
    return addUnit(anchor, 'month', -6);
  }

  get visibleEnd(): Date {
    const now = new Date();
    const anchor =
      this.timescale === 'hour' ? startOfHour(now) :
      this.timescale === 'day'  ? startOfDay(now)  :
      this.timescale === 'week' ? startOfWeek(now) :
      
  startOfMonth(now);
    if (this.timescale === 'hour') return addUnit(anchor, 'hour', 24);
    if (this.timescale === 'day')  return addUnit(anchor, 'day', 14);
    if (this.timescale === 'week') return addUnit(anchor, 'week', 8);
    return addUnit(anchor, 'month', 6);
  }

  get units(): GridUnit[] {
    const out: GridUnit[] = [];
    let cursor = new Date(this.visibleStart);

    while (cursor < this.visibleEnd) {
      out.push({
        key: this.keyFor(cursor),
        label: formatHeaderLabel(cursor, this.timescale),
        date: new Date(cursor),
      });
      cursor = addUnit(cursor, this.timescale, 1);
    }

    return out;
  }

  get gridWidthPx(): number {
    return this.units.length * this.unitWidth[this.timescale];
  }

  get todayLeftPx(): number {
    const now = new Date();
    const marker = this.timescale === 'hour' ? startOfHour(now) : startOfDay(now);
    const offset = diffUnits(this.visibleStart, marker, this.timescale);
    return offset * this.unitWidth[this.timescale];
  }

  get currentPeriodStart(): Date {
    const now = new Date();

    if (this.timescale === 'hour') return startOfHour(now);
    if (this.timescale === 'day') return startOfDay(now);
    if (this.timescale === 'week') return startOfWeek(now);
    return startOfMonth(now);
  }

  get currentPeriodLeftPx(): number {
    const offset = diffUnits(this.visibleStart, this.currentPeriodStart, this.timescale);
    return offset * this.unitWidth[this.timescale];
  }

  get currentPeriodLabel(): string {
    if (this.timescale === 'hour') return 'Current hour';
    if (this.timescale === 'day') return 'Today';
    if (this.timescale === 'week') return 'Current week';
    return 'Current month';
  }

  private keyFor(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    if (this.timescale === 'hour') {
      const h = String(d.getHours()).padStart(2, '0');
      return `${y}-${m}-${day}T${h}`;
    }
    if (this.timescale === 'day') return `${y}-${m}-${day}`;
    if (this.timescale === 'week') return `${y}-w-${m}-${day}`;
    return `${y}-${m}`;
  }
}