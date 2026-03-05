import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SEED_WORK_CENTERS } from '../../data/seed-work-centers';
import { Timescale } from '../../../core/models/timescale.model';
import { TimescaleSelectComponent } from '../timescale-select/timescale-select.component';
import { TimelineGridComponent } from '../timeline-grid/timeline-grid.component';

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

  onTimescaleChange(next: Timescale) {
    this.timescale = next;
  }
}