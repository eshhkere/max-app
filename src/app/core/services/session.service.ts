import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, interval, Subscription } from 'rxjs';
import { 
  StartSessionRequest, 
  StartSessionResponse,
  CancelSessionRequest,
  CompleteSessionResponse,
  HeartbeatRequest,
  SessionState 
} from '../models/session.model';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://shop-stars-tg-bot.cloudpub.ru';

  readonly sessionId = signal<string | null>(null);
  readonly state = signal<SessionState>(SessionState.IDLE);
  readonly remainingSeconds = signal<number>(0);
  readonly cancelSecondsLeft = signal<number>(15);

  private heartbeatSubscription?: Subscription;
  private timerSubscription?: Subscription;
  private cancelTimerSubscription?: Subscription;
  private heartbeatTimeout?: ReturnType<typeof setTimeout>; // ← ДОБАВЛЕНО

  private focusStartTime = 0;
  private plannedMinutes = 0;

  async startSession(tag: string, comment: string, plannedMinutes: number): Promise<void> {
    try {
      console.log('📤 Starting session:', { tag, comment, planned_minutes: plannedMinutes });
      
      const response = await firstValueFrom(
        this.http.post<StartSessionResponse>(`${this.baseUrl}/api/sessions/start`, {
          tag,
          comment,
          planned_minutes: plannedMinutes
        } as StartSessionRequest)
      );

      console.log('📥 Session created:', response.data.session_id);
      this.sessionId.set(response.data.session_id);
      this.plannedMinutes = plannedMinutes;
      
      this.state.set(SessionState.CANCEL_PERIOD);
      this.startCancelPeriod();
      this.startHeartbeat();

      console.log('✅ Session started:', response.data.session_id);
    } catch (error) {
      console.error('❌ Failed to start session:', error);
      throw error;
    }
  }

  private startCancelPeriod(): void {
    this.cancelSecondsLeft.set(15);
    
    this.cancelTimerSubscription = interval(1000).subscribe(() => {
      const left = this.cancelSecondsLeft() - 1;
      this.cancelSecondsLeft.set(left);

      if (left <= 0) {
        this.cancelTimerSubscription?.unsubscribe();
        this.startFocusSession();
      }
    });
  }

  private startFocusSession(): void {
    console.log('🎯 Starting focus session');
    this.state.set(SessionState.FOCUS);
    this.focusStartTime = Date.now() / 1000;
    this.remainingSeconds.set(this.plannedMinutes * 60);
    this.startTimer();
  }

  private startTimer(): void {
    this.timerSubscription = interval(1000).subscribe(() => {
      const now = Date.now() / 1000;
      const elapsed = now - this.focusStartTime;
      const remaining = Math.max(0, this.plannedMinutes * 60 - elapsed);
  
      this.remainingSeconds.set(Math.floor(remaining));
  
      if (remaining <= 0 && this.state() === SessionState.FOCUS) {
        this.timerSubscription?.unsubscribe();
        this.completeSession(); // ← именно здесь!
      }
      
    });
  }
  
  
  

  // ✅ ИСПРАВЛЕНО: heartbeat с задержкой 15 секунд
  private startHeartbeat(): void {
    // ✅ Первый heartbeat через 15 секунд
    this.heartbeatTimeout = setTimeout(async () => {
      await this.sendHeartbeat();
      
      // Потом каждые 15 секунд
      this.heartbeatSubscription = interval(15000).subscribe(async () => {
        await this.sendHeartbeat();
      });
    }, 15000); // ← ЗАДЕРЖКА 15 секунд!
  }

  private async sendHeartbeat(): Promise<void> {
    const sid = this.sessionId();
    console.log('💓 Sending heartbeat for:', sid);
    
    if (!sid) {
      console.error('❌ No session_id for heartbeat!');
      return;
    }
  
    try {
      await firstValueFrom(
        this.http.post(`${this.baseUrl}/api/sessions/heartbeat`, {
          session_id: sid
        } as HeartbeatRequest)
      );
      console.log('✅ Heartbeat sent');
    } catch (error) {
      console.error('❌ Heartbeat failed:', error);
    }
  }

  async cancelSession(reasonCode?: string): Promise<void> {
    const sid = this.sessionId();
    console.log('🚫 Cancelling session:', sid);
    
    if (!sid) {
      console.error('❌ No session_id for cancel!');
      return;
    }

    try {
      await firstValueFrom(
        this.http.post(`${this.baseUrl}/api/sessions/cancel`, {
          session_id: sid,
          reason_code: reasonCode
        } as CancelSessionRequest)
      );

      this.cleanup();
      this.state.set(SessionState.CANCELLED);
      console.log('✅ Session cancelled');
    } catch (error) {
      console.error('❌ Failed to cancel session:', error);
      this.cleanup();
    }
  }

  async completeSession(): Promise<CompleteSessionResponse['data'] | null> {
    const sid = this.sessionId();
    
    if (!sid) {
      console.error('❌ No session_id for complete!');
      return null;
    }
  
    const currentState = this.state();
    if (currentState === SessionState.COMPLETED || currentState === SessionState.CANCELLED) {
      console.warn('⚠️ Session already finished, state:', currentState);
      return null;
    }
    
  
    console.log('🎉 Completing session:', sid);
  
    // Останавливаем всё ПЕРЕД запросом
    this.heartbeatSubscription?.unsubscribe();
    this.timerSubscription?.unsubscribe();
    this.cancelTimerSubscription?.unsubscribe();
    
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
    }
  
    this.state.set(SessionState.COMPLETED);
  
    try {
      const response = await firstValueFrom(
        this.http.post<CompleteSessionResponse>(`${this.baseUrl}/api/sessions/complete`, {
          session_id: sid
        })
      );
  
      this.sessionId.set(null);
      this.remainingSeconds.set(0);
      this.focusStartTime = 0;
      
      console.log('✅ Session completed:', response.data);
      
      // ✅ Возвращаем данные!
      return response.data;
  
    } catch (error) {
      console.error('❌ Failed to complete session:', error);
      
      this.sessionId.set(null);
      this.remainingSeconds.set(0);
      this.focusStartTime = 0;
      
      return null;
    }
  }
  
  

  private cleanup(): void {
    console.log('🧹 Cleaning up session');
    this.heartbeatSubscription?.unsubscribe();
    this.timerSubscription?.unsubscribe();
    this.cancelTimerSubscription?.unsubscribe();
    
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
    }
    
    this.sessionId.set(null);
    this.remainingSeconds.set(0);
    this.focusStartTime = 0;
  }

  getFormattedTime(): string {
    const total = this.remainingSeconds();
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}
