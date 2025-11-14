import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { TimerService } from '../../core/services/timer.service';
import { SessionService } from '../../core/services/session.service';
import { MotivationService } from '../../core/services/motivation.service';

@Component({
  selector: 'app-session',
  standalone: true,
  imports: [NgIf],
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss']
})
export class SessionComponent implements OnInit {
  private readonly timer = inject(TimerService);
  private readonly sessionService = inject(SessionService);
  private readonly motivation = inject(MotivationService);
  private readonly router = inject(Router);

  readonly sessionState = this.sessionService.state;
  readonly sessionId = this.sessionService.sessionId; // ← Добавили
  readonly motivationPhrase = this.motivation.currentPhrase;

  ngOnInit() {
    // Проверяем есть ли активная сессия
    if (!this.sessionId()) {
      console.warn('⚠️ No active session, redirecting to home');
      this.router.navigate(['/home']);
      return;
    }

    console.log('✅ Session started:', this.sessionId());
  }

  getFormattedTime(): string {
    return this.timer.getFormattedTime();
  }

  async onCancel() {
    console.log('❌ User cancelled session');
    await this.sessionService.cancelSession('distraction');
  }
}
