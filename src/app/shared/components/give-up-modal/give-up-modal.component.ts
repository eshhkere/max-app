import { NgFor } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output, signal } from '@angular/core';

export interface GiveUpReason {
  code: string;
  label: string;
}

const GIVE_UP_REASONS: GiveUpReason[] = [
  { code: 'устал', label: 'Устал' },
  { code: 'потерял мотивацию', label: 'Потерял мотивацию' },
  { code: 'соцсети', label: 'Соцсети' },
  { code: 'сложная задача', label: 'Сложная задача' },
  { code: 'другое', label: 'Другое' },
];

@Component({
  selector: 'app-give-up-modal',
  standalone: true,
  imports: [NgFor],
  templateUrl: './give-up-modal.component.html',
  styleUrls: ['./give-up-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GiveUpModalComponent {
  @Output() reasonSelected = new EventEmitter<string>();
  @Output() closed = new EventEmitter<void>();

  readonly reasons = GIVE_UP_REASONS;
  readonly selectedReason = signal<string | null>(null);

  onSelectReason(reasonCode: string): void {
    this.selectedReason.set(reasonCode);
    // Сразу отправляем выбранную причину
    this.reasonSelected.emit(reasonCode);
  }

  onClose(): void {
    this.closed.emit();
  }
}
