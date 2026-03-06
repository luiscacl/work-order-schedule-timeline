import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SEED_WORK_CENTERS } from '../../data/seed-work-centers';
import { Timescale } from '../../../core/models/timescale.model';
import { TimescaleSelectComponent } from '../timescale-select/timescale-select.component';
import { TimelineGridComponent } from '../timeline-grid/timeline-grid.component';
import { WorkOrder } from '../../../core/models/work-order.model';
import { SEED_WORK_ORDERS } from '../../data/seed-work-orders';

@Component({
  selector: 'app-schedule-shell',
  standalone: true,
  imports: [CommonModule, TimescaleSelectComponent, TimelineGridComponent],
  templateUrl: './schedule-shell.component.html',
  styleUrl: './schedule-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleShellComponent {
  timescale: Timescale = 'month';
  readonly workCenters = SEED_WORK_CENTERS;
  workOrders: WorkOrder[] = SEED_WORK_ORDERS;

  onTimescaleChange(next: Timescale) {
    this.timescale = next;
  }

  openEditPanel(order: WorkOrder) {
    console.log('EDIT', order);
  }

  deleteWorkOrder(order: WorkOrder) {
    console.log('DELETE', order);
    this.workOrders = this.workOrders.filter(o => o.docId !== order.docId);
  }
}