// group-room-modal.component.ts
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';

export interface GroupParticipant {
  id: string;
  name: string | null;
}

@Component({
  selector: 'app-group-room-modal',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './group-room-modal.component.html',
  styleUrls: ['./group-room-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupRoomModalComponent {
  @Input() roomCode = '';
  @Input() participants: GroupParticipant[] = [];
  @Input() isOwner = false;

  @Output() closed = new EventEmitter<void>();
  @Output() start = new EventEmitter<void>();

  get participantSlots(): GroupParticipant[] {
    const maxSlots = 4;
    const filled = this.participants || [];
    const withEmpty = [...filled];

    for (let i = filled.length; i < maxSlots; i++) {
      withEmpty.push({ id: `empty-${i}`, name: null });
    }

    return withEmpty;
  }

  onClose(): void {
    this.closed.emit();
  }

  onStart(): void {
    if (!this.isOwner || this.participants.length === 0) {
      return;
    }
    this.start.emit();
  }
}
