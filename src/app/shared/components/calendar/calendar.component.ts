import { Component, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnChanges {
  @Input() month?: Date;
  @Input() initialDate?: string;
  @Output() dateSelected = new EventEmitter<string>();

  private _calendarDate: Date;
  private _selectedDate: Date;

  constructor() {
    // по умолчанию и текущий месяц, и выбранный день = сегодня
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this._calendarDate = new Date(today);
    this._selectedDate = new Date(today);
  }

  ngOnChanges(changes: SimpleChanges) {
    // Если меняется month проп, обновляем текущий месяц (но не выбранный день)
    if (changes['month'] && this.month) {
      this._calendarDate = new Date(this.month);
    }

    // Если приходит новая initialDate — жёстко пересинхронить выбранную дату и месяц
    if (changes['initialDate'] && this.initialDate) {
      const d = new Date(this.initialDate);
      d.setHours(0, 0, 0, 0);
      this._selectedDate = new Date(d);
      this._calendarDate = new Date(d);
    }
  }

  calendarDate(): Date {
    return this._calendarDate;
  }

  setMonth(offset: number): void {
    const newDate = new Date(this._calendarDate);
    newDate.setMonth(newDate.getMonth() + offset);
    this._calendarDate = newDate;
  }

  select(day: number): void {
    const selectedDate = new Date(this._calendarDate);
    selectedDate.setDate(day);
    selectedDate.setHours(0, 0, 0, 0);
    this._selectedDate = selectedDate;

    if (this._selectedDate) {
      const y = this._selectedDate.getFullYear();
      const m = (this._selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const d = this._selectedDate.getDate().toString().padStart(2, '0');
      this.dateSelected.emit(`${y}-${m}-${d}`); // локальная дата без UTC
    }
    
  }

  weeks(): (number | null)[][] {
    const year = this._calendarDate.getFullYear();
    const month = this._calendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0).getDate();

    const weeks: (number | null)[][] = [];
    let week: (number | null)[] =
      new Array(firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1).fill(null);

    for (let day = 1; day <= lastDay; day++) {
      week.push(day);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }

    if (week.length) {
      while (week.length < 7) week.push(null);
      weeks.push(week);
    }

    return weeks;
  }

  isToday(day: number, date: Date): boolean {
    if (!day) return false;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return (
      day === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }

  isSelected(day: number, date: Date): boolean {
    if (!day || !this._selectedDate) return false;

    return (
      day === this._selectedDate.getDate() &&
      date.getMonth() === this._selectedDate.getMonth() &&
      date.getFullYear() === this._selectedDate.getFullYear()
    );
  }
}
