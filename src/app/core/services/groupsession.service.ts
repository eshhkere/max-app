// src/app/core/services/group-session.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription, firstValueFrom } from 'rxjs';

import { AuthService } from './auth.service';
import { BASE_URL } from '../constants/base-url';
import type { SessionCompleteData } from '../../shared/components/session-complete-modal/session-complete-modal.component';

export interface GroupParticipant {
  id: string;
  name: string | null;
}

export enum GroupStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  IN_ROOM = 'IN_ROOM',
  RUNNING = 'RUNNING',
}

@Injectable({ providedIn: 'root' })
export class GroupSessionService {
  private readonly auth = inject(AuthService);
  private readonly http = inject(HttpClient);

  private socket: Socket | null = null;

  // состояние комнаты/сессии
  readonly status = signal<GroupStatus>(GroupStatus.DISCONNECTED);
  readonly roomCode = signal<string | null>(null);
  readonly sessionCode = signal<string | null>(null);
  readonly lastRoomState = signal<any | null>(null);
  readonly participants = signal<GroupParticipant[]>([]);
  readonly ownerId = signal<string | null>(null);
  readonly groupCompleteData = signal<SessionCompleteData | null>(null);

  // таймер общей сессии
  readonly remainingSeconds = signal<number>(0);
  private plannedSeconds = 0;
  private focusStartTimestamp = 0; // unix‑time (секунды)
  private timerSub?: Subscription;

  // heartbeat по session_code (как в python-клиенте)
  private heartbeatSub?: Subscription;

  private baseUrl = BASE_URL.replace('/api', ''); // https://shop-stars... без /api

  // ---------- подключение с нужными query ----------

  private connectWithQuery(extraQuery: Record<string, string>): void {
    const token = this.auth.getToken();
    if (!token) {
      console.warn('[GroupSession] no JWT, cannot connect');
      return;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    const query = { jwt: token, ...extraQuery };

    console.log('[GroupSession] connecting to', this.baseUrl, query);
    this.status.set(GroupStatus.CONNECTING);
    this.roomCode.set(null);
    this.sessionCode.set(null);
    this.lastRoomState.set(null);
    this.participants.set([]);
    this.ownerId.set(null);
    this.stopGroupTimer();
    this.stopHeartbeat();

    // namespace /ws
    this.socket = io(this.baseUrl + '/ws', {
      path: '/socket.io',
      transports: ['websocket'],
      query,
      reconnection: true,
    });

    this.registerListeners();
  }

  private registerListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('[GroupSession] ✅ ws connected', this.socket?.id);
    });

    this.socket.on('disconnect', reason => {
      console.log('[GroupSession] ⚠️ ws disconnected', reason);
      this.status.set(GroupStatus.DISCONNECTED);
      this.stopGroupTimer();
      this.stopHeartbeat();
    });

    // ----- room:state -----
    this.socket.on('room:state', payload => {
      console.log('[room:state]', payload);
      this.lastRoomState.set(payload);

      const room = (payload || {}).room || {};
      const code = room.id ?? room.code ?? null;
      const owner = room.owner ?? null; // строка "10"

      this.roomCode.set(code);
      this.ownerId.set(owner);

      // backend шлёт members как массив строк с python-dict внутри:
      // "{'user_id': '10', 'username': 'Федор Безруков', ...}"
      const rawMembers: any[] = room.members || room.users || room.participants || [];

      const parsed: GroupParticipant[] = rawMembers.map((m: any, idx: number) => {
        let obj: any = null;

        if (typeof m === 'string') {
          try {
            const jsonLike = m.replace(/'/g, '"');
            obj = JSON.parse(jsonLike);
          } catch {
            obj = { user_id: idx.toString(), username: m };
          }
        } else if (typeof m === 'object' && m != null) {
          obj = m;
        }

        return {
          id: String(obj?.user_id ?? obj?.id ?? idx),
          name: obj?.username ?? obj?.name ?? null,
        };
      });

      this.participants.set(parsed);

      if (code) {
        this.status.set(GroupStatus.IN_ROOM);
      }
    });

    // ----- buddy:start -----
    this.socket.on('buddy:start', data => {
        console.log('[buddy:start]', data);
        const sessionCode = data?.session_code ?? null;
        const minutes = data?.planned_minutes ?? 25;
      
        if (!sessionCode) {
          console.warn('[GroupSession] buddy:start без session_code');
          return;
        }
      
        this.sessionCode.set(sessionCode);
        this.status.set(GroupStatus.RUNNING); // <- важно
      
        this.plannedSeconds = minutes * 60;
        this.focusStartTimestamp = Math.floor(Date.now() / 1000);
        this.remainingSeconds.set(this.plannedSeconds);
      
        this.startGroupTimer();
        this.startHeartbeat(sessionCode);
      });

      this.socket.on('room:completed', payload => {
        console.log('[room:completed]', payload);
        // payload: { earned_xp, earned_coins, current_level, current_xp, max_level_xp, current_coins }
        const data: SessionCompleteData = {
          current_coins: payload.current_coins,
          current_level: payload.current_level,
          current_xp: payload.current_xp,
          earned_coins: payload.earned_coins,
          earned_xp: payload.earned_xp,
          max_level_xp: payload.max_level_xp,
        };
      
        this.groupCompleteData.set(data);
      
        this.status.set(GroupStatus.IN_ROOM);
        this.sessionCode.set(null);
        this.stopGroupTimer();
        this.stopHeartbeat();
      });

    this.socket.on('error', err => {
      console.error('[ws:error]', err);
    });
  }

  // ---------- таймер общей сессии ----------

  private startGroupTimer(): void {
    this.timerSub?.unsubscribe();

    this.timerSub = interval(1000).subscribe(() => {
      const now = Math.floor(Date.now() / 1000);
      const elapsed = now - this.focusStartTimestamp;
      const left = Math.max(this.plannedSeconds - elapsed, 0);

      this.remainingSeconds.set(left);

      if (left <= 0) {
        this.timerSub?.unsubscribe();
        this.timerSub = undefined;
      }
    });
  }

  private stopGroupTimer(): void {
    this.timerSub?.unsubscribe();
    this.timerSub = undefined;
    this.remainingSeconds.set(0);
  }

  // ---------- heartbeat (HTTP /api/sessions/heartbeat) ----------

  private startHeartbeat(sessionId: string): void {
    const token = this.auth.getToken();
    if (!token) {
      console.warn('[GroupSession] no token for heartbeat');
      return;
    }

    this.stopHeartbeat();

    this.heartbeatSub = interval(10000).subscribe(async () => {
      try {
        await firstValueFrom(
          this.http.post(
            `${BASE_URL}/api/sessions/heartbeat`,
            { session_id: sessionId },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          )
        );
      } catch (e) {
        console.warn('[GroupSession] heartbeat error', e);
      }
    });
  }

  private stopHeartbeat(): void {
    this.heartbeatSub?.unsubscribe();
    this.heartbeatSub = undefined;
  }

  // ---------- публичный API ----------

  /** Создать комнату: ?jwt=...&create=1 */
  createRoom(): void {
    this.connectWithQuery({ create: '1' });
  }

  /** Войти по коду: ?jwt=...&code=XXXX */
  joinRoom(code: string): void {
    this.connectWithQuery({ code });
  }

  /** Лидер комнаты отправляет buddy:start */
  startBuddySession(plannedMinutes: number, tag: string): void {
    if (!this.socket) {
      console.warn('[GroupSession] no socket');
      return;
    }

    const code = this.roomCode();
    if (!code) {
      console.warn('[GroupSession] no room code, join/create first');
      return;
    }

    this.socket.emit(
      'buddy:start',
      { code, planned_minutes: plannedMinutes, tag },
      (ack: any) => {
        console.log('[ack:buddy:start]', ack);
      }
    );
  }

  leaveRoom(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.status.set(GroupStatus.DISCONNECTED);
    this.roomCode.set(null);
    this.sessionCode.set(null);
    this.lastRoomState.set(null);
    this.participants.set([]);
    this.ownerId.set(null);
    this.stopGroupTimer();
    this.stopHeartbeat();
  }

  /** Выход из активной групповой сессии (кнопка "Сдаться" в кооп-режиме) */
  async giveUp(): Promise<void> {
    const sessionId = this.sessionCode();
    if (!sessionId) {
      console.warn('[GroupSession] giveUp: no sessionCode');
      return;
    }

    try {
      // TODO: уточнить у бэкендера точный API.
      await firstValueFrom(
        this.http.post(
          `${BASE_URL}/api/sessions/cancel`,
          { session_id: sessionId }
        )
      );
    } catch (e) {
      console.error('[GroupSession] giveUp error', e);
    } finally {
      this.status.set(GroupStatus.DISCONNECTED);
      this.roomCode.set(null);
      this.sessionCode.set(null);
      this.lastRoomState.set(null);
      this.participants.set([]);
      this.ownerId.set(null);
      this.stopGroupTimer();
      this.stopHeartbeat();
    }
  }
}
