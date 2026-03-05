import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';
import { Timescale, TIMESCALE_LABEL } from '../../../core/models/timescale.model';

@Component({
  selector: 'app-timescale-select',
  standalone: true,
  imports: [CommonModule, NgSelectModule, ReactiveFormsModule],
  templateUrl: './timescale-select.component.html',
  styleUrl: './timescale-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimescaleSelectComponent implements OnChanges {
  @Input({ required: true }) value!: Timescale;
  @Output() valueChange = new EventEmitter<Timescale>();

  readonly label = TIMESCALE_LABEL;

  readonly timescales: Array<{ label: string; value: Timescale }> = [
    { label: this.label.hour, value: 'hour' },
    { label: this.label.day, value: 'day' },
    { label: this.label.week, value: 'week' },
    { label: this.label.month, value: 'month' },
  ];

  readonly control = new FormControl<Timescale>(this.value ?? 'month', { nonNullable: true });

  constructor() {
    this.control.valueChanges.subscribe(v => this.valueChange.emit(v));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] && this.value) {
      this.control.setValue(this.value, { emitEvent: false });
    }
  }
}