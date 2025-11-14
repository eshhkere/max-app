import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';

@Component({
  selector: 'app-calendar',
  standalone: true,
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent {
  @Input() selectedDate: Date = new Date();
  @Output() selectDate = new EventEmitter<Date>();

  readonly calendarDate = signal(new Date(this.selectedDate));
  
  readonly weeks = computed(() => this.generateCalendar(this.calendarDate()));

  setMonth(delta: number) {
    const date = new Date(this.calendarDate());
    date.setMonth(date.getMonth() + delta);
    this.calendarDate.set(date);
  }

  select(day: number) {
    const date = new Date(this.calendarDate());
    date.setDate(day);
    this.selectDate.emit(date);
  }

  private generateCalendar(ref: Date): number[][] {
    const year = ref.getFullYear();
    const month = ref.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = (firstDay.getDay() + 6) % 7; // пн-вс
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: number[] = [];
    for (let i = 0; i < startDayOfWeek; i++) days.push(0);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    while (days.length % 7 !== 0) days.push(0);

    const weeks: number[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    return weeks;
  }
}
