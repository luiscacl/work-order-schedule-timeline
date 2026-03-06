import { ChangeDetectionStrategy, Component, Input, ViewChild, ElementRef, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Timescale } from '../../../core/models/timescale.model';
import { WorkCenter } from '../../../core/models/work-center.model';
import { addUnit, formatHeaderLabel, startOfDay, startOfHour, startOfMonth, startOfWeek, parseISODate } from '../../../core/utils/date.utils';
import { WorkOrder } from '../../../core/models/work-order.model';
import { WorkOrderBarComponent } from '../work-order-bar/work-order-bar.component';
import { HostListener } from '@angular/core';

type GridUnit = { key: string; label: string; date: Date };
type TimeResolution = { minutes: number };

@Component({
  selector: 'app-timeline-grid',
  standalone: true,
  imports: [CommonModule, WorkOrderBarComponent],
  templateUrl: './timeline-grid.component.html',
  styleUrl: './timeline-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineGridComponent {
  @Input({ required: true }) timescale!: Timescale;
  @Input({ required: true }) workCenters!: WorkCenter[];
  @Input({ required: true }) workOrders!: WorkOrder[];
  @Output() editOrder = new EventEmitter<WorkOrder>();
  @Output() deleteOrder = new EventEmitter<WorkOrder>();
  @Output() createAt = new EventEmitter<{ workCenterId: string; start: Date; end: Date }>();
  @ViewChild('scrollEl') scrollEl?: ElementRef<HTMLDivElement>;
  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent) {
    const t = ev.target as HTMLElement;
    if (t.closest('.menu-overlay') || t.closest('.bar__menu')) return;
    this.closeMenu();
  }
  @HostListener('window:scroll')
  onWindowScroll() {
    this.closeMenu();
  }
  @HostListener('document:mousedown', ['$event'])
  onDocMouseDown(ev: MouseEvent) {
    const t = ev.target as HTMLElement;
    if (t.closest('.menu-overlay') || t.closest('.bar__menu')) return;
    this.closeMenu();
  }

  hoveredId: string | null = null;
  hoverRowId: string | null = null;
  ghostX = 0;
  ghostVisible = false;
  ghostXRaw = 0;
  openMenuOrderId: string | null = null;
  menuOrder: WorkOrder | null = null;
  menuTop = 0;
  menuLeft = 0;

  readonly menuWidth = 160;
  readonly ghostUnits = 1;
  readonly leftColWidth = 280;
  readonly rowHeight = 52;
  readonly headerHeight = 44;
  readonly ghostFixedWidthPx = 113;
  readonly unitWidth: Record<Timescale, number> = {
    hour: 114,
    day: 114,
    week: 114,
    month: 114,
  };

  ngAfterViewInit(): void {
    this.centerOnCurrent();

    const el = this.scrollEl?.nativeElement;
    if (!el) return;

    el.addEventListener(
      'pointerup',
      (ev) => this.onTimelinePointerUp(ev as PointerEvent),
      { passive: true }
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['timescale'] && !changes['timescale'].firstChange) {
      this.centerOnCurrent();
    }
    if (changes['workCenters'] && !changes['workCenters'].firstChange) {
      this.centerOnCurrent();
    }
  }

  onToggleMenu(orderId: string) {
    this.openMenuOrderId = this.openMenuOrderId === orderId ? null : orderId;
  }


  onEdit(o: WorkOrder) {
    this.editOrder.emit(o);
  }

  onRemove(o: WorkOrder) {
    this.deleteOrder.emit(o);
  }

  onRowMouseMove(ev: MouseEvent, wcId: string) {
    const target = ev.target as HTMLElement;
    if (this.openMenuOrderId) {
      this.ghostVisible = false;
      return;
    }
    if (
      target.closest('app-work-order-bar') ||
      target.closest('.bar__menu') ||
      target.closest('.menu-overlay')
    ) {
      this.ghostVisible = false;
      return;
    }

    const x = this.getTimelineX(ev);

    if (this.isXOverAnyBar(wcId, x)) {
      this.ghostVisible = false;
      return;
    }

    this.hoverRowId = wcId;
    this.ghostXRaw = x;
    this.ghostX = this.snapX(x);
    this.ghostVisible = true;
  }

  onRowMouseLeave() {
    this.hoverRowId = null;
    this.ghostVisible = false;
  }

  onMenuToggle(e: { order: WorkOrder; rect: DOMRect }) {
    if (this.menuOrder?.docId === e.order.docId) {
      this.closeMenu();
      return;
    }

    this.menuOrder = e.order;

    const offsetY = 5;
    this.menuTop = Math.round(e.rect.bottom + offsetY);

    this.menuLeft = Math.round(e.rect.left);

    const pad = 8;
    const vw = window.innerWidth;
    this.menuLeft = Math.max(pad, Math.min(this.menuLeft, vw - this.menuWidth - pad));
  }

  closeMenu() {
    this.menuOrder = null;
  }

  handleEdit(o: WorkOrder) {
    this.onEdit(o);
    this.closeMenu();
  }

  handleDelete(o: WorkOrder) {
    this.onRemove(o);
    this.closeMenu();
  }

  ghostStartDate(): Date {
    return this.xToDate(this.ghostX);
  }

  barLeftPx(order: WorkOrder): number {
    const start = parseISODate(order.data.startDate);
    return this.xForDate(start);
  }

  barWidthPx(order: WorkOrder): number {
    const start = parseISODate(order.data.startDate);
    const end = parseISODate(order.data.endDate);
    const endExclusive = addUnit(startOfDay(end), 'day', 1);

    const x1 = this.xForDate(start);
    const x2 = this.xForDate(endExclusive);

    return Math.max(2, x2 - x1); 
  }

  ghostWidthPx(): number {
    return this.ghostFixedWidthPx;
  }

  getGhostRangeFromClick(xClick: number): { start: Date; end: Date } {
    const snappedX = this.snapX(xClick);

    const start = this.xToDate(snappedX);
    const end = this.xToDate(snappedX + this.ghostFixedWidthPx);

    return { start, end };
  }

  private get maxX(): number {
    return Math.max(0, this.gridWidthPx);
  }

  get ordersByCenter(): Record<string, WorkOrder[] | undefined> {
    const map: Record<string, WorkOrder[] | undefined> = {};
    for (const o of this.workOrders ?? []) {
      const id = o.data.workCenterId;
      (map[id] ||= []).push(o);
    }
    for (const k of Object.keys(map)) {
      map[k]!.sort((a, b) => a.data.startDate.localeCompare(b.data.startDate));
    }
    return map;
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
    return this.xForDate(new Date());
  }

  get currentPeriodStart(): Date {
    const now = new Date();

    if (this.timescale === 'hour') return startOfHour(now);
    if (this.timescale === 'day') return startOfDay(now);
    if (this.timescale === 'week') return startOfWeek(now);
    return startOfMonth(now);
  }

  get currentPeriodLeftPx(): number {
    return this.xForDate(new Date());
  }

  get currentPeriodLabel(): string {
    if (this.timescale === 'hour') return 'Current hour';
    if (this.timescale === 'day') return 'Today';
    if (this.timescale === 'week') return 'Current week';
    return 'Current month';
  }

  private msPerHour = 60 * 60 * 1000;
  private msPerDay  = 24 * this.msPerHour;
  private readonly resolution: Record<Timescale, TimeResolution> = {
    hour: { minutes: 15 },
    day: { minutes: 30 },
    week:{ minutes: 60 * 24 },
    month:{ minutes: 60 * 24 },
  };

  private daysInMonth(d: Date): number {
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  }

  private snapX(x: number): number {
    const d = this.xToDate(x);
    const snapped = this.snapDate(d);
    return this.xForDate(snapped);
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

  private xForDate(d: Date): number {
    if (this.timescale === 'hour') {
      const vs = this.visibleStart;
      const hours = (d.getTime() - vs.getTime()) / this.msPerHour;
      const pxPerHour = this.unitWidth.hour;
      return hours * pxPerHour;
    }

    if (this.timescale === 'day') {
      const vs = startOfDay(this.visibleStart);
      const ms = d.getTime() - vs.getTime();
      const days = ms / this.msPerDay; 
      return days * this.unitWidth.day;
    }

    if (this.timescale === 'week') {
      const start = startOfDay(d);
      const days = (start.getTime() - startOfDay(this.visibleStart).getTime()) / this.msPerDay;
      const pxPerDay = this.unitWidth.week / 7;
      return days * pxPerDay;
    }

    return this.xForDateInMonthScale(d);
  }

  private xToDate(x: number): Date {
    const xc = Math.max(0, x);

    if (this.timescale === 'hour') {
      const minutes = (xc / this.unitWidth.hour) * 60;
      return new Date(this.visibleStart.getTime() + minutes * 60 * 1000);
    }

    if (this.timescale === 'day') {
      const minutes = (xc / this.unitWidth.day) * 24 * 60;
      return new Date(startOfDay(this.visibleStart).getTime() + minutes * 60 * 1000);
    }

    if (this.timescale === 'week') {
      const days = (xc / (this.unitWidth.week / 7));
      return new Date(startOfDay(this.visibleStart).getTime() + days * this.msPerDay);
    }

    return this.dateFromMonthX(xc);
  }

  private xForDateInMonthScale(d: Date): number {
    const target = startOfDay(d);
    let cursor = startOfMonth(this.visibleStart);
    const targetMonth = startOfMonth(target);

    let x = 0;

    while (cursor.getFullYear() < targetMonth.getFullYear() ||
          (cursor.getFullYear() === targetMonth.getFullYear() && cursor.getMonth() < targetMonth.getMonth())) {
      x += this.unitWidth.month;
      cursor = addUnit(cursor, 'month', 1);
    }

    const dim = this.daysInMonth(cursor);
    const dayIndex = target.getDate() - 1;
    x += (dayIndex / dim) * this.unitWidth.month;

    return x;
  }

  private dateFromMonthX(x: number): Date {
    let cursor = startOfMonth(this.visibleStart);
    let acc = 0;

    while (acc + this.unitWidth.month <= x) {
      acc += this.unitWidth.month;
      cursor = addUnit(cursor, 'month', 1);
    }

    const dim = this.daysInMonth(cursor);
    const pxPerDay = this.unitWidth.month / dim;
    const inside = x - acc;

    const dayIndex = Math.min(dim - 1, Math.max(0, Math.floor(inside / pxPerDay)));
    return new Date(cursor.getFullYear(), cursor.getMonth(), 1 + dayIndex);
  }

  private snapDate(d: Date): Date {
    const stepMin = this.resolution[this.timescale].minutes;
    const msStep = stepMin * 60 * 1000;

    const anchor =
      this.timescale === 'hour' ? this.visibleStart :
      this.timescale === 'day' ? startOfDay(this.visibleStart) :
      this.timescale === 'week' ? startOfDay(this.visibleStart) :
      startOfDay(this.visibleStart); 

    const delta = d.getTime() - anchor.getTime();
    const snapped = Math.floor(delta / msStep) * msStep;
    return new Date(anchor.getTime() + snapped);
  }

  private isXOverAnyBar(wcId: string, x: number): boolean {
    const orders = this.ordersByCenter[wcId] ?? [];
    for (const o of orders) {
      const left = this.barLeftPx(o);
      const right = left + this.barWidthPx(o);
      if (x >= left && x <= right) return true;
    }
    return false;
  }

  private clampX(x: number): number {
    return Math.min(Math.max(0, x), this.maxX);
  }

  private getTimelineX(ev: MouseEvent): number {
    const scroll = this.scrollEl?.nativeElement;
    if (!scroll) return 0;

    const rect = scroll.getBoundingClientRect();
    const x = (ev.clientX - rect.left) + scroll.scrollLeft;

    return this.clampX(x);
  }

  private onTimelinePointerUp(ev: PointerEvent) {
    if (ev.pointerType === 'mouse' && ev.button !== 0) return;

    const path = ev.composedPath() as Array<EventTarget>;
    const elTarget = (path.find(n => n instanceof HTMLElement) as HTMLElement | undefined) ?? (ev.target as HTMLElement);

    if (elTarget.closest('.menu-overlay') || elTarget.closest('.bar__menu') || elTarget.closest('app-work-order-bar')) {
      return;
    }

    const row = elTarget.closest('.grid__row') as HTMLElement | null;
    if (!row) {
      return;
    }

    const wcId = row.dataset['wc'] || row.getAttribute('data-wc');
    if (!wcId) {
      return;
    }

    const x = this.getTimelineXFromPointer(ev);
    if (this.isXOverAnyBar(wcId, x)) return;

    const { start, end } = this.getGhostRangeFromClick(x);
    this.createAt.emit({ workCenterId: wcId, start, end });
  }

  private getTimelineXFromPointer(ev: PointerEvent): number {
    const scroll = this.scrollEl?.nativeElement;
    if (!scroll) return 0;

    const rect = scroll.getBoundingClientRect();
    const x = (ev.clientX - rect.left) + scroll.scrollLeft;
    return this.clampX(x);
  }
}