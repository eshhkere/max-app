import { Injectable, NgZone, signal } from '@angular/core';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  private readonly destroy$ = new Subject<void>();
  private readonly remainingMsSignal = signal<number>(0);
  private endTimestamp: number | null = null;

  readonly remainingMs = this.remainingMsSignal.asReadonly();

  constructor(private readonly ngZone: NgZone) {}

  start(endTimestamp: number): void {
    this.teardown();
    this.endTimestamp = endTimestamp;

    this.ngZone.runOutsideAngular(() => {
      interval(200)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.ngZone.run(() => this.tick()); // Запускаем в zone
        });
    });
  }

  stop(): void {
    this.teardown();
    this.endTimestamp = null;
    this.remainingMsSignal.set(0);
  }

  getFormattedTime(): string {
    const totalSeconds = Math.ceil(this.remainingMs() / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  private tick(): void {
    if (!this.endTimestamp) return;

    const remaining = Math.max(this.endTimestamp - Date.now(), 0);
    this.remainingMsSignal.set(remaining);

    if (remaining === 0) {
      this.teardown();
    }
  }

  private teardown(): void {
    this.destroy$.next();
  }
}
