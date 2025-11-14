import { Injectable, signal } from '@angular/core';
import { interval, Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LocalTimerService {
  readonly isRunning = signal<boolean>(false);
  readonly remainingSeconds = signal<number>(0);

  private timerSubscription?: Subscription;
  private totalSeconds = 0;

  startTimer(minutes: number): void {
    this.stopTimer();
    
    this.totalSeconds = minutes * 60;
    this.remainingSeconds.set(this.totalSeconds);
    this.isRunning.set(true);

    console.log(`⏱️ Starting local timer: ${minutes} minutes`);

    this.timerSubscription = interval(1000).subscribe(() => {
      const remaining = this.remainingSeconds() - 1;
      
      if (remaining <= 0) {
        this.stopTimer();
        this.remainingSeconds.set(0);
        console.log('⏱️ Local timer completed');
      } else {
        this.remainingSeconds.set(remaining);
      }
    });
  }

  stopTimer(): void {
    this.timerSubscription?.unsubscribe();
    this.isRunning.set(false);
    this.remainingSeconds.set(0);
    console.log('⏱️ Local timer stopped');
  }

  getFormattedTime(): string {
    const total = this.remainingSeconds();
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}
