import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal, effect } from '@angular/core';

export interface TimerOption {
  minutes: number;
  label: string;
}

const FOCUS_TIMER_OPTIONS: TimerOption[] = [
  { minutes: 5, label: '5 мин' },
  { minutes: 10, label: '10 мин' },
  { minutes: 15, label: '15 мин' },
  { minutes: 20, label: '20 мин' },
  { minutes: 25, label: '25 мин' },
  { minutes: 30, label: '30 мин' },
  { minutes: 35, label: '35 мин' },
  { minutes: 40, label: '40 мин' },
  { minutes: 45, label: '45 мин' },
  { minutes: 50, label: '50 мин' },
];

const BREAK_TIMER_OPTIONS: TimerOption[] = [
  { minutes: 5, label: '5 мин' },
  { minutes: 10, label: '10 мин' },
  { minutes: 15, label: '15 мин' },
  { minutes: 20, label: '20 мин' },
];

@Component({
  selector: 'app-timer-select',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './timer-select.component.html',
  styleUrls: ['./timer-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimerSelectComponent {
  @Input() set isFocusMode(value: boolean) {
    this._isFocusMode = value;
    // ✅ Сразу обновляем опции при изменении Input
    this.timerOptions.set(value ? FOCUS_TIMER_OPTIONS : BREAK_TIMER_OPTIONS);
    console.log('🔧 Timer mode changed:', value ? 'FOCUS' : 'BREAK', 'Options:', this.timerOptions().length);
  }
  get isFocusMode(): boolean {
    return this._isFocusMode;
  }
  private _isFocusMode: boolean = true;

  @Input() set defaultMinutes(value: number) {
    this.selectedMinutes.set(value);
  }
  
  @Output() timeSelected = new EventEmitter<number>();
  @Output() closed = new EventEmitter<void>();

  readonly selectedMinutes = signal<number>(25);
  readonly timerOptions = signal<TimerOption[]>(FOCUS_TIMER_OPTIONS);

  onSelectTime(minutes: number): void {
    this.selectedMinutes.set(minutes);
  }

  onConfirm(): void {
    this.timeSelected.emit(this.selectedMinutes());
  }

  onClose(): void {
    this.closed.emit();
  }

  getTitle(): string {
    return this.isFocusMode ? 'Выберите время фокуса' : 'Выберите время перерыва';
  }
}
