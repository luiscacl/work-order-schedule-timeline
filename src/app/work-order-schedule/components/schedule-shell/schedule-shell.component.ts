import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SEED_WORK_CENTERS } from '../../data/seed-work-centers';
import { Timescale } from '../../../core/models/timescale.model';
import { TimescaleSelectComponent } from '../timescale-select/timescale-select.component';
import { TimelineGridComponent } from '../timeline-grid/timeline-grid.component';
import { WorkOrder } from '../../../core/models/work-order.model';
import { SEED_WORK_ORDERS } from '../../data/seed-work-orders';
import { addUnit, startOfDay } from '../../../core/utils/date.utils';
import { DrawerSavePayload, WorkOrderDrawerComponent } from '../work-order-drawer/work-order-drawer.component';

type DrawerMode = 'create' | 'edit';

@Component({
  selector: 'app-schedule-shell',
  standalone: true,
  imports: [CommonModule, TimescaleSelectComponent, TimelineGridComponent, WorkOrderDrawerComponent],
  templateUrl: './schedule-shell.component.html',
  styleUrl: './schedule-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleShellComponent {
  timescale: Timescale = 'month';
  drawerOpen = false;
  drawerMode: DrawerMode = 'create';
  drawerWorkCenterId: string | null = null;
  drawerStart: Date | null = null;
  drawerEnd: Date | null = null;
  editingOrder: WorkOrder | null = null;
  readonly workCenters = SEED_WORK_CENTERS;
  workOrders: WorkOrder[] = SEED_WORK_ORDERS;

  onTimescaleChange(next: Timescale) {
    this.timescale = next;
  }

  deleteWorkOrder(order: WorkOrder) {
    this.workOrders = this.workOrders.filter(o => o.docId !== order.docId);
  }

  openCreatePanel(e: { workCenterId: string; start: Date; end: Date }) {
    this.drawerMode = 'create';
    this.drawerOpen = true;
    this.drawerWorkCenterId = e.workCenterId;

    const s = startOfDay(e.start);
    this.drawerStart = s;
    this.drawerEnd = addUnit(s, 'day', 7);

    this.editingOrder = null;
  }

  openEditPanel(order: WorkOrder) {
    this.drawerMode = 'edit';
    this.drawerOpen = true;
    this.editingOrder = order;

    this.drawerWorkCenterId = null;
    this.drawerStart = null;
    this.drawerEnd = null;
  }

  closeDrawer() {
    this.drawerOpen = false;
    this.editingOrder = null;
  }

  onDrawerSave(payload: DrawerSavePayload) {
    if (payload.mode === 'create') {
      const newOrder: WorkOrder = {
        docId: crypto.randomUUID(),
        docType: 'workOrder',
        data: {
          name: payload.name,
          workCenterId: payload.workCenterId,
          status: payload.status,
          startDate: payload.startDateISO,
          endDate: payload.endDateISO,
        },
      };

      this.workOrders = [...this.workOrders, newOrder];
      this.closeDrawer();
      return;
    }

    const id = payload.docId!;
    this.workOrders = this.workOrders.map(o =>
      o.docId === id
        ? {
            ...o,
            data: {
              ...o.data,
              name: payload.name,
              status: payload.status,
              startDate: payload.startDateISO,
              endDate: payload.endDateISO,
            },
          }
        : o
    );

    this.closeDrawer();
  }
}