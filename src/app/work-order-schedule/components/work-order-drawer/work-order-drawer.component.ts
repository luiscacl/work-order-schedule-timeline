import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

import { WorkOrder } from '../../../core/models/work-order.model';
import { addUnit, parseISODate, startOfDay } from '../../../core/utils/date.utils';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NgbDateMDYDotFormatter } from '../../../core/utils/ngb-date-mdY-formatter';

export type DrawerMode = 'create' | 'edit';
export type WorkOrderStatus = 'open' | 'in-progress' | 'complete' | 'blocked';

export type DrawerSavePayload = {
  mode: DrawerMode;
  workCenterId: string;
  docId?: string;
  name: string;
  status: WorkOrderStatus;
  startDateISO: string;
  endDateISO: string;
};

@Component({
  selector: 'app-work-order-drawer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule, NgbDatepickerModule],
  templateUrl: './work-order-drawer.component.html',
  styleUrl: './work-order-drawer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NgbDateParserFormatter, useClass: NgbDateMDYDotFormatter },
  ],
})
export class WorkOrderDrawerComponent {
  private fb = inject(FormBuilder);

  open = input(false);
  mode = input<DrawerMode>('create');

  workCenterId = input<string | null>(null);
  startPrefill = input<Date | null>(null);
  endPrefill = input<Date | null>(null);

  editingOrder = input<WorkOrder | null>(null);
  allOrders = input<WorkOrder[]>([]);

  cancel = output<void>();
  save = output<DrawerSavePayload>();

  overlapError: string | null = null;

  statusOptions = [
    { label: 'Open', value: 'open' as WorkOrderStatus },
    { label: 'In progress', value: 'in-progress' as WorkOrderStatus },
    { label: 'Complete', value: 'complete' as WorkOrderStatus },
    { label: 'Blocked', value: 'blocked' as WorkOrderStatus },
  ];

  constructor() {
    effect(() => {
      if (!this.open()) return;
      this.syncFromInputs();
    });
  }

  get statusClass(): string {
    const v = this.form.value.status ?? 'open';
    return `status-${v}`;
  }

  onBackdropClick() {
    this.cancel.emit();
  }

  onSubmit() {
    this.overlapError = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const start = this.fromStruct(this.form.value.start!);
    const end = this.fromStruct(this.form.value.end!);

    if (end.getTime() <= start.getTime()) {
      this.overlapError = 'End date must be after start date.';
      return;
    }

    const wcId =
      this.mode() === 'edit' ? this.editingOrder()?.data.workCenterId : this.workCenterId();

    if (!wcId) return;

    const startISO = this.toISODate(start);
    const endISO = this.toISODate(end);

    const excludeId = this.mode() === 'edit' ? this.editingOrder()?.docId : undefined;
    if (this.hasOverlap(wcId, startISO, endISO, excludeId)) {
      this.overlapError = 'This work order overlaps another order on the same work center.';
      return;
    }

    this.save.emit({
      mode: this.mode(),
      workCenterId: wcId,
      docId: this.mode() === 'edit' ? this.editingOrder()?.docId : undefined,
      name: this.form.value.name!.trim(),
      status: this.form.value.status!,
      startDateISO: startISO,
      endDateISO: endISO,
    });
  }

  private hasOverlap(wcId: string, startISO: string, endISO: string, excludeId?: string): boolean {
    const start = parseISODate(startISO);
    const end = parseISODate(endISO);

    for (const o of this.allOrders()) {
      if (o.data.workCenterId !== wcId) continue;
      if (excludeId && o.docId === excludeId) continue;

      const os = parseISODate(o.data.startDate);
      const oe = parseISODate(o.data.endDate);

      if (start.getTime() <= oe.getTime() && end.getTime() >= os.getTime()) return true;
    }
    return false;
  }

  private toStruct(d: Date): NgbDateStruct {
    return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
  }

  private fromStruct(s: NgbDateStruct): Date {
    return new Date(s.year, s.month - 1, s.day);
  }

  private toISODate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private dateRangeValidator = (group: AbstractControl): ValidationErrors | null => {
    const start = group.get('start')?.value as NgbDateStruct | null;
    const end = group.get('end')?.value as NgbDateStruct | null;
    if (!start || !end) return null;

    const s = new Date(start.year, start.month - 1, start.day).getTime();
    const e = new Date(end.year, end.month - 1, end.day).getTime();

    return e > s ? null : { dateRange: true };
  };

  private syncFromInputs(): void {
    this.overlapError = null;

    if (this.mode() === 'edit' && this.editingOrder()) {
      const o = this.editingOrder()!;
      this.form.patchValue(
        {
          name: o.data.name,
          status: o.data.status as WorkOrderStatus,
          start: this.toStruct(parseISODate(o.data.startDate)),
          end: this.toStruct(parseISODate(o.data.endDate)),
        },
        { emitEvent: false }
      );
      return;
    }

    const s = this.startPrefill() ? startOfDay(this.startPrefill()!) : startOfDay(new Date());
    const e = this.endPrefill() ? startOfDay(this.endPrefill()!) : addUnit(s, 'day', 7);
    this.form.patchValue(
      { name: '', status: 'open', start: this.toStruct(s), end: this.toStruct(e) },
      { emitEvent: false }
    );
  }

  form = this.fb.group(
    {
      name: ['', [Validators.required]],
      status: ['open' as WorkOrderStatus, [Validators.required]],
      start: [null as NgbDateStruct | null, [Validators.required]],
      end: [null as NgbDateStruct | null, [Validators.required]],
    },
    { validators: [this.dateRangeValidator] }
  );
}