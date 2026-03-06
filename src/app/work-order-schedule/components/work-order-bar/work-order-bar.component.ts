import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkOrder } from '../../../core/models/work-order.model';

@Component({
  selector: 'app-work-order-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './work-order-bar.component.html',
  styleUrl: './work-order-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkOrderBarComponent {
  @Input({ required: true }) order!: WorkOrder;

  @Output() edit = new EventEmitter<WorkOrder>();
  @Output() remove = new EventEmitter<WorkOrder>();
  @Input() menuOpen = false;
  @Output() menuClose = new EventEmitter<void>();
  @Output() menuToggle = new EventEmitter<{ order: WorkOrder; rect: DOMRect }>();

  toggleMenu(ev: MouseEvent, btn: HTMLElement) {
    ev.stopPropagation();
    this.menuToggle.emit({ order: this.order, rect: btn.getBoundingClientRect() });
  }

  onEdit(ev: MouseEvent) {
    ev.stopPropagation();
    this.menuClose.emit();
    this.edit.emit(this.order);
  }

  onRemove(ev: MouseEvent) {
    ev.stopPropagation();
    this.menuClose.emit();
    this.remove.emit(this.order);
  }

  get statusLabel(): string {
    const s = this.order.data.status;
    if (s === 'open') return 'Open';
    if (s === 'in-progress') return 'In progress';
    if (s === 'complete') return 'Complete';
    return 'Blocked';
  }
}