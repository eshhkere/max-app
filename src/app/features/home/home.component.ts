import { NgIf } from '@angular/common';
import { Component, inject, signal, effect } from '@angular/core';
import { SessionService } from '../../core/services/session.service';
import { LocalTimerService } from '../../core/services/local-timer.service';
import { TagService } from '../../core/services/tag.service';
import { CurrencyService } from '../../core/services/currency.service';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { TagMenuComponent } from '../../shared/components/tag-menu/tag-menu.component';
import { TimerSelectComponent } from '../../shared/components/timer-select/timer-select.component';
import { GiveUpModalComponent } from '../../shared/components/give-up-modal/give-up-modal.component';
import { SessionCompleteModalComponent, SessionCompleteData } from '../../shared/components/session-complete-modal/session-complete-modal.component';
import { TagOption, SessionState } from '../../core/models/session.model';
import { SidebarMenuComponent } from '../../shared/components/sidebar-menu/sidebar-menu.component';

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
    SidebarMenuComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  private readonly sessionService = inject(SessionService);
  private readonly localTimer = inject(LocalTimerService);
  private readonly tagService = inject(TagService);
  private readonly currencyService = inject(CurrencyService);

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

  // ← СЛУШАЕМ ДАННЫЕ ИЗ СЕРВИСА, НЕ ВЫЗЫВАЕМ completeSession!
  readonly _effect = effect(() => {
    const data = this.sessionService.completeSessionData();
    if (data) {
      console.log('✅ Complete data received:', data);
      this.completeData.set(data);
      this.showCompleteModal.set(true);
      this.currencyService.balance.set(data.current_coins);
    }
  }, { allowSignalWrites: true });

  get selectedMinutes(): number {
    return this.isFocusActive() ? this.focusMinutes() : this.breakMinutes();
  }

  onTimerClick(): void {
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
    if (this.localTimer.isRunning()) {
      this.localTimer.stopTimer();
    }
    this.isFocusActive.update(v => !v);
  }

  async onActionButtonClick(): Promise<void> {
    const state = this.sessionState();

    if (!this.isFocusActive()) {
      if (this.localTimer.isRunning()) {
        this.localTimer.stopTimer();
      } else {
        this.localTimer.startTimer(this.breakMinutes());
      }
      return;
    }

    if (state === SessionState.IDLE) {
      const tag = this.activeTag()?.id || 'study';
      const comment = this.tagService.comment();
      await this.sessionService.startSession(tag, comment, this.selectedMinutes);
    } else if (state === SessionState.CANCEL_PERIOD) {
      await this.sessionService.cancelSession();
    } else if (state === SessionState.FOCUS) {
      this.showGiveUpModal.set(true);
    }
  }

  async onGiveUpReasonSelected(reasonCode: string): Promise<void> {
    this.showGiveUpModal.set(false);
    await this.sessionService.cancelSession(reasonCode);
  }

  onGiveUpModalClosed(): void {
    this.showGiveUpModal.set(false);
  }

  onTakeBreak(): void {
    this.showCompleteModal.set(false);
  }

  onCompleteCancel(): void {
    this.showCompleteModal.set(false);
  }

  onStartSession(): void {
    this.onActionButtonClick();
  }

  getActionButtonText(): string {
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
    if (this.isFocusActive()) {
      const state = this.sessionState();
      return state === SessionState.CANCEL_PERIOD || state === SessionState.FOCUS;
    }
    return this.localTimer.isRunning();
  }

  onMusicClick(): void {
    console.log('🎵 Music button clicked');
  }

  onMenuClick(): void {
    this.showSidebarMenu.set(true);
  }

  onMenuClosed(): void {
    this.showSidebarMenu.set(false);
  }

  onMenuItemSelected(itemId: string): void {
    console.log('📍 Navigate to:', itemId);
  }

  testOpenModal(): void {
    this.completeData.set({
      current_coins: 441,
      current_level: 10,
      current_xp: 100,
      earned_coins: 111,
      earned_xp: 251,
      max_level_xp: 3001.0
    });
    this.showCompleteModal.set(true);
  }
}