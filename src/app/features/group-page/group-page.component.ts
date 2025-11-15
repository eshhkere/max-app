// src/app/features/group/group-page.component.ts
import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';

import { GroupSessionService, GroupParticipant, GroupStatus } from '../../core/services/groupsession.service';
import { GroupJoinModalComponent } from '../../shared/components/group-join-modal/group-join-modal.component';
import { GroupRoomModalComponent } from '../../shared/components/group-room-modal/group-room-modal.component';
import { SidebarMenuComponent } from '../../shared/components/sidebar-menu/sidebar-menu.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-group-page',
  standalone: true,
  imports: [NgIf, GroupJoinModalComponent, GroupRoomModalComponent, SidebarMenuComponent],
  templateUrl: './group-page.component.html',
  styleUrls: ['./group-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupPageComponent {
  private readonly router = inject(Router);
  private readonly groupSession = inject(GroupSessionService);
  private readonly auth = inject(AuthService);

  readonly showJoinModal = signal(false);
  readonly showRoomModal = signal(false);
  showSidebarMenu = signal(false);

  get roomCode(): string | null {
    return this.groupSession.roomCode();
  }

  get isOwner(): boolean {
    const ownerId = this.groupSession.ownerId();
    const meId = this.auth.userSignal()?.id;
    if (!ownerId || meId == null) return false;
    return String(ownerId) === String(meId);
  }

  get participants(): GroupParticipant[] {
    return this.groupSession.participants();
  }

  get canStart(): boolean {
    return this.isOwner && !!this.groupSession.roomCode();
  }

  constructor() {
    // авто-переход на home, когда группа реально запустилась
    effect(() => {
      if (this.groupSession.status() === GroupStatus.RUNNING) {
        this.router.navigate(['/home']);
      }
    });
  }

  onBack(): void {
    this.groupSession.leaveRoom();
    this.router.navigate(['/home']);
  }

  onCreateRoom(): void {
    this.groupSession.createRoom();
    this.showJoinModal.set(false);
    this.showRoomModal.set(true);
  }

  onOpenJoinModal(): void {
    this.showJoinModal.set(true);
    this.showRoomModal.set(false);
  }

  onJoinGroupRoom(code: string): void {
    this.groupSession.joinRoom(code);
    this.showJoinModal.set(false);
    this.showRoomModal.set(true);
  }

  onRoomClosed(): void {
    this.showRoomModal.set(false);
  }

  onStartSession(): void {
    if (!this.canStart) return;
    this.groupSession.startBuddySession(25, 'спорт');
    // дальше эффект по статусу сам перекинет на /home
  }

  // ---- меню ----

  onMenuClick(): void {
    this.showSidebarMenu.set(true);
  }

  onMenuClosed(): void {
    this.showSidebarMenu.set(false);
  }

  onMenuItemSelected(itemId: string): void {
    this.showSidebarMenu.set(false);

    if (itemId === 'home') {
      this.groupSession.leaveRoom();
      this.router.navigate(['/home']);
      return;
    }

    if (itemId === 'statistics') {
      this.groupSession.leaveRoom();
      this.router.navigate(['/statistics']);
      return;
    }

    if (itemId === 'history') {
      this.groupSession.leaveRoom();
      this.router.navigate(['/history']);
      return;
    }

    if (itemId === 'group') {
      // уже здесь, ничего не делаем
      return;
    }
  }
}
