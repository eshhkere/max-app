import { Injectable } from '@angular/core';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class HeartbeatService {
  private readonly destroy$ = new Subject<void>();
  private sessionId: string | null = null;

  start(sessionId: string): void {
    this.sessionId = sessionId;
    
    // MOCK: Просто логируем каждые 10 секунд
    interval(10000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        console.log('💓 Heartbeat (MOCK):', this.sessionId);
      });
  }

  stop(): void {
    this.destroy$.next();
    this.sessionId = null;
  }
}
