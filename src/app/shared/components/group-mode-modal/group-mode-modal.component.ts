// group-mode-modal.component.ts
import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-group-mode-modal',
  standalone: true,
  imports: [NgIf],
  templateUrl: './group-mode-modal.component.html',
  styleUrls: ['./group-mode-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupModeModalComponent {
  @Output() closed = new EventEmitter<void>();
  @Output() createRoomClicked = new EventEmitter<void>();
  @Output() joinRoomClicked = new EventEmitter<void>();

  onClose(): void {
    this.closed.emit();
  }

  onCreateRoom(): void {
    this.createRoomClicked.emit();
  }

  onJoinRoom(): void {
    this.joinRoomClicked.emit();
  }
}
