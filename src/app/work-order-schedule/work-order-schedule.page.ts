import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ScheduleShellComponent } from './components/schedule-shell/schedule-shell.component';

@Component({
  selector: 'app-work-order-schedule-page',
  standalone: true,
  imports: [ScheduleShellComponent],
  templateUrl: './work-order-schedule.page.html',
  styleUrl: './work-order-schedule.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkOrderSchedulePage {}