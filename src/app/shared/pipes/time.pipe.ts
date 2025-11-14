import { Pipe, PipeTransform } from '@angular/core';

/**
 * TimePipe formats milliseconds into a mm:ss string representation.
 */
@Pipe({
  name: 'time',
  standalone: true,
})
export class TimePipe implements PipeTransform {
  transform(value: number): string {
    if (!Number.isFinite(value) || value <= 0) {
      return '00:00';
    }

    const totalSeconds = Math.floor(value / 1000);
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }
}

