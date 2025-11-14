import { NgIf, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

export interface SessionCompleteData {
  current_coins: number;
  current_level: number;
  current_xp: number;
  earned_coins: number;
  earned_xp: number;
  max_level_xp: number;
}

@Component({
  selector: 'app-session-complete-modal',
  standalone: true,
  imports: [NgIf, DecimalPipe],
  templateUrl: './session-complete-modal.component.html',
  styleUrls: ['./session-complete-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionCompleteModalComponent {
  @Input() data!: SessionCompleteData;
  
  @Output() takeBreak = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  getProgressPercentage(): number {
    if (!this.data) return 0;
    return Math.min(100, (this.data.current_xp / this.data.max_level_xp) * 100);
  }

  onTakeBreak(): void {
    this.takeBreak.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
