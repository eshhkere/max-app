import { NgIf } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { SessionService } from '../../core/services/session.service';
import { LocalTimerService } from '../../core/services/local-timer.service';
import { TagService } from '../../core/services/tag.service';
import { CurrencyService } from '../../core/services/currency.service';
import {
  GroupSessionService,
  GroupParticipant,
  GroupStatus,
} from '../../core/services/groupsession.service';
import { AuthService } from '../../core/services/auth.service';

import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { TagMenuComponent } from '../../shared/components/tag-menu/tag-menu.component';
import { TimerSelectComponent } from '../../shared/components/timer-select/timer-select.component';
import { GiveUpModalComponent } from '../../shared/components/give-up-modal/give-up-modal.component';
import {
  SessionCompleteModalComponent,
  SessionCompleteData,
} from '../../shared/components/session-complete-modal/session-complete-modal.component';
import { TagOption, SessionState } from '../../core/models/session.model';
import { SidebarMenuComponent } from '../../shared/components/sidebar-menu/sidebar-menu.component';
import { MusicMenuComponent } from '../../shared/components/music-menu/music-menu.component';

enum RobotAnimation {
  NEUTRAL = 'NEUTRAL',
  FOCUS = 'FOCUS',
  VICTORY = 'VICTORY',
  DEFEAT = 'DEFEAT',
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    NgIf,
    AvatarComponent,
    TagMenuComponent,
    TimerSelectComponent,
    GiveUpModalComponent,
    SessionCompleteModalComponent,
    SidebarMenuComponent,
    MusicMenuComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  private readonly sessionService = inject(SessionService);
  private readonly localTimer = inject(LocalTimerService);
  private readonly tagService = inject(TagService);
  private readonly currencyService = inject(CurrencyService);
  private readonly router = inject(Router);
  private readonly groupSession = inject(GroupSessionService);
  private readonly authService = inject(AuthService);

  readonly robotState = signal<RobotAnimation>(RobotAnimation.NEUTRAL);
  readonly showMusicMenu = signal(false);

  readonly activeTag = this.tagService.activeTag;
  readonly balance = this.currencyService.balance;
  readonly isFocusActive = signal(true);

  readonly showTagModal = signal(false);
  readonly showTimerModal = signal(false);
  readonly showGiveUpModal = signal(false);
  readonly showCompleteModal = signal(false);
  readonly showSidebarMenu = signal(false);
  readonly completeData = signal<SessionCompleteData | null>(null);

  readonly focusMinutes = signal<number>(25);
  readonly breakMinutes = signal<number>(5);

  readonly availableTags = this.tagService.availableTags;
  readonly sessionState = this.sessionService.state;
  readonly cancelSecondsLeft = this.sessionService.cancelSecondsLeft;
  readonly localTimerRunning = this.localTimer.isRunning;

  readonly motivationText = signal<string | null>(null);
  private motivationIntervalId: any = null;

  private readonly MOTIVATION_MESSAGES: string[] = [
    'Сделай этот фокус важным',
    'Одно дело за раз — и ты в плюсе',
    'Сейчас ты строишь своё будущее',
    'Каждая минута — вклад в навык',
    'Продолжай, ты на правильном пути',
    'Сконцентрируйся, остальное подождёт',
    'Меньше отвлечений — больше результата',
    'Ты уже ближе, чем был вчера',
    'Твой мозг скажет спасибо позже',
    'Маленький шаг, но в верном направлении',
    'Фокус — это суперсила, которую ты тренируешь',
    'Сделай эту сессию максимально полезной',
    'Ещё чуть‑чуть — и будет легче',
    'Ты хозяин своего внимания',
    'Отложи сомнения, делай действие',
    'Тишина вокруг — сила внутри',
    'Не гонись за идеалом, двигайся вперёд',
    'Каждый фокус — плюс к уверенности',
    'Сейчас важен только следующий шаг',
    'Результат придёт, если досидеть',
    'Отвлечения подождут, дело — нет',
    'Твоя дисциплина уже впечатляет',
    'Чем сложнее, тем ценнее результат',
    'Ты можешь больше, чем думаешь',
    'Фокус сегодня — свобода завтра',
    'Ещё немного — и будет заслуженный отдых',
    'Ты вкладываешься в себя, это главное',
    'Сохраняй курс, не смотри по сторонам',
    'Эта сессия двигает тебя вперёд',
    'Ты молодец, что не сдался в начале',
  ];

  // ---- эффекты завершения ----

  // одиночная сессия
  readonly _effect = effect(
    () => {
      const data = this.sessionService.completeSessionData();
      if (data) {
        console.log('✅ Complete data received (solo):', data);
        this.completeData.set(data);
        this.showCompleteModal.set(true);
        this.currencyService.balance.set(data.current_coins);
        this.robotState.set(RobotAnimation.VICTORY);
        this.stopMotivation();
      }
    },
    { allowSignalWrites: true }
  );

  // кооп-сессия
  readonly _groupEffect = effect(
    () => {
      const getter = this.groupSession.groupCompleteData as
        | (() => SessionCompleteData | null)
        | undefined;
      const data = getter ? getter() : null;
      if (data) {
        console.log('✅ Group complete data received:', data);
        this.completeData.set(data);
        this.showCompleteModal.set(true);
        this.currencyService.balance.set(data.current_coins);
        this.groupSession.groupCompleteData.set(null);
        this.robotState.set(RobotAnimation.VICTORY);
        this.stopMotivation();
      }
    },
    { allowSignalWrites: true }
  );

  // кооп: как только статус RUNNING — фокус-анимация + мотивация
  readonly _groupRunningEffect = effect(
    () => {
      const status = this.groupSession.status();
      if (status === GroupStatus.RUNNING) {
        this.robotState.set(RobotAnimation.FOCUS);
        this.startMotivation();
      }
    },
    { allowSignalWrites: true }
  );

  // ---- вычисляемые значения ----

  get avatarVideoSrc(): string {
    switch (this.robotState()) {
      case RobotAnimation.FOCUS:
        return '/assets/videos/focus_robot.webm';
      case RobotAnimation.VICTORY:
        return '/assets/videos/victory_robot.webm';
      case RobotAnimation.DEFEAT:
        return '/assets/videos/defeat_robot.webm';
      case RobotAnimation.NEUTRAL:
      default:
        return '/assets/videos/neutral_robot.webm';
    }
  }

  get selectedMinutes(): number {
    return this.isFocusActive() ? this.focusMinutes() : this.breakMinutes();
  }

  // ---- кооп‑состояние ----

  get isGroupRunning(): boolean {
    return this.groupSession.status() === GroupStatus.RUNNING;
  }

  get otherParticipants(): GroupParticipant[] {
    const all = this.groupSession.participants();
    const meId = this.authService.userSignal()?.id;

    const filtered =
      meId != null ? all.filter(p => String(p.id) !== String(meId)) : all;

    return filtered.slice(0, 3);
  }

  // ----------------- Таймер / фокус -----------------

  onTimerClick(): void {
    if (this.isGroupRunning) {
      return;
    }

    if (!this.isFocusActive()) {
      this.showTimerModal.set(true);
    } else {
      const state = this.sessionState();
      if (state === SessionState.IDLE) {
        this.showTimerModal.set(true);
      }
    }
  }

  onTimeSelected(minutes: number): void {
    if (this.isFocusActive()) {
      this.focusMinutes.set(minutes);
    } else {
      this.breakMinutes.set(minutes);
    }
    this.showTimerModal.set(false);
  }

  onTimerModalClosed(): void {
    this.showTimerModal.set(false);
  }

  onTagClick(): void {
    if (this.isGroupRunning) {
      return;
    }
    this.showTagModal.set(true);
  }

  onTagSelected(tag: TagOption): void {
    this.tagService.setActiveTag(tag);
  }

  onCommentChanged(comment: string): void {
    this.tagService.updateComment(comment);
  }

  onModalClosed(): void {
    this.showTagModal.set(false);
  }

  onToggleFocus(): void {
    if (this.isGroupRunning) {
      return;
    }

    if (this.localTimer.isRunning()) {
      this.localTimer.stopTimer();
    }
    this.isFocusActive.update(v => !v);

    if (this.isFocusActive()) {
      this.robotState.set(RobotAnimation.FOCUS);
      this.startMotivation();
    } else {
      this.robotState.set(RobotAnimation.NEUTRAL);
      this.stopMotivation();
    }
  }

  async onActionButtonClick(): Promise<void> {
    const state = this.sessionState();

    // кооп: сдаться
    if (this.isGroupRunning) {
      await this.groupSession.giveUp();
      this.robotState.set(RobotAnimation.DEFEAT);
      this.stopMotivation();
      return;
    }

    // перерыв
    if (!this.isFocusActive()) {
      if (this.localTimer.isRunning()) {
        this.localTimer.stopTimer();
      } else {
        this.localTimer.startTimer(this.breakMinutes());
      }
      return;
    }

    // одиночный фокус
    if (state === SessionState.IDLE) {
      const tag = this.activeTag()?.id || 'study';
      const comment = this.tagService.comment();
      await this.sessionService.startSession(tag, comment, this.selectedMinutes);

      if (this.isFocusActive()) {
        this.robotState.set(RobotAnimation.FOCUS);
        this.startMotivation();
      } else {
        this.robotState.set(RobotAnimation.NEUTRAL);
        this.stopMotivation();
      }
    } else if (state === SessionState.CANCEL_PERIOD) {
      await this.sessionService.cancelSession();
    } else if (state === SessionState.FOCUS) {
      this.showGiveUpModal.set(true);
    }
  }

  async onGiveUpReasonSelected(reasonCode: string): Promise<void> {
    this.showGiveUpModal.set(false);
    await this.sessionService.cancelSession(reasonCode);
    this.robotState.set(RobotAnimation.DEFEAT);
    this.stopMotivation();
  }

  onGiveUpModalClosed(): void {
    this.showGiveUpModal.set(false);
  }

  onTakeBreak(): void {
    this.showCompleteModal.set(false);

    this.isFocusActive.set(false);
    this.breakMinutes.set(5);
    this.localTimer.startTimer(this.breakMinutes());

    this.robotState.set(RobotAnimation.NEUTRAL);
    this.stopMotivation();
  }

  onCompleteCancel(): void {
    this.showCompleteModal.set(false);

    if (this.isGroupRunning || this.sessionState() === SessionState.FOCUS) {
      this.robotState.set(RobotAnimation.FOCUS);
      this.startMotivation();
    } else {
      this.robotState.set(RobotAnimation.NEUTRAL);
      this.stopMotivation();
    }
  }

  onStartSession(): void {
    this.onActionButtonClick();
  }

  getActionButtonText(): string {
    if (this.isGroupRunning) {
      return 'Сдаться';
    }

    if (!this.isFocusActive()) {
      return this.localTimer.isRunning() ? 'Отменить' : 'Старт';
    }

    const state = this.sessionState();
    switch (state) {
      case SessionState.IDLE:
        return 'Старт';
      case SessionState.CANCEL_PERIOD:
        return `Отменить (${this.cancelSecondsLeft()})`;
      case SessionState.FOCUS:
        return 'Сдаться';
      default:
        return 'Старт';
    }
  }

  getTimerDisplay(): string {
    if (this.isGroupRunning) {
      return this.groupTimerDisplay;
    }

    if (!this.isFocusActive()) {
      if (this.localTimer.isRunning()) {
        return this.localTimer.getFormattedTime();
      }
      const mins = this.breakMinutes().toString().padStart(2, '0');
      return `${mins}:00`;
    }

    const state = this.sessionState();
    if (state === SessionState.IDLE) {
      const mins = this.focusMinutes().toString().padStart(2, '0');
      return `${mins}:00`;
    }

    return this.sessionService.getFormattedTime();
  }

  getFocusButtonText(): string {
    return this.isFocusActive() ? 'Фокус' : 'Перерыв';
  }

  isTimerRunning(): boolean {
    if (this.isGroupRunning) {
      return true;
    }

    if (this.isFocusActive()) {
      const state = this.sessionState();
      return (
        state === SessionState.CANCEL_PERIOD || state === SessionState.FOCUS
      );
    }
    return this.localTimer.isRunning();
  }

  onMusicClick(): void {
    // открываем модалку выбора музыки
    this.showMusicMenu.set(true);
  }

  // ----------------- Меню / навигация -----------------

  onMenuClick(): void {
    this.showSidebarMenu.set(true);
  }

  onMenuClosed(): void {
    this.showSidebarMenu.set(false);
  }

  onMenuItemSelected(itemId: string): void {
    this.showSidebarMenu.set(false);

    if (itemId === 'home') {
      this.router.navigate(['/home']);
      return;
    }

    if (itemId === 'statistics') {
      this.router.navigate(['/statistics']);
      return;
    }

    if (itemId === 'history') {
      this.router.navigate(['/history']);
      return;
    }

    if (itemId === 'group') {
      this.router.navigate(['/group']);
      return;
    }

    console.log('📍 Unknown menu item:', itemId);
  }

  // ---- мотивация ----

  private startMotivation(): void {
    if (!this.isFocusActive() && !this.isGroupRunning) {
      return;
    }

    if (!this.motivationText()) {
      this.motivationText.set(this.pickRandomMessage());
    }

    if (this.motivationIntervalId) {
      clearInterval(this.motivationIntervalId);
    }

    this.motivationIntervalId = setInterval(() => {
      this.motivationText.set(this.pickRandomMessage());
    }, 15000);
  }

  private stopMotivation(): void {
    if (this.motivationIntervalId) {
      clearInterval(this.motivationIntervalId);
      this.motivationIntervalId = null;
    }
    this.motivationText.set(null);
  }

  private pickRandomMessage(): string {
    const list = this.MOTIVATION_MESSAGES;
    if (!list.length) return '';
    const index = Math.floor(Math.random() * list.length);
    return list[index];
  }

  // ---- helpers ----

  get groupTimerDisplay(): string {
    const total = this.groupSession.remainingSeconds();
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }

  onMusicMenuClosed(): void {
    this.showMusicMenu.set(false);
  }
  
  onMusicTrackSelected(trackId: string | null): void {
    console.log('🎵 selected track from home:', trackId);
    this.showMusicMenu.set(false);
  }
}
