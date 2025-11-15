// group-join-modal.component.ts
import { ChangeDetectionStrategy, Component, EventEmitter, Output, signal } from '@angular/core';

@Component({
  selector: 'app-group-join-modal',
  standalone: true,
  templateUrl: './group-join-modal.component.html',
  styleUrls: ['./group-join-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupJoinModalComponent {
  @Output() closed = new EventEmitter<void>();
  @Output() joined = new EventEmitter<string>();

  readonly codeInput = signal<string>('');

  onCodeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    // только цифры, максимум 5
    this.codeInput.set(input.value.replace(/\D/g, '').slice(0, 5));
  }

  onJoin(): void {
    const code = this.codeInput();
    if (!code || code.length < 3) {
      return;
    }
    this.joined.emit(code);
    this.codeInput.set('');
  }

  onClose(): void {
    this.closed.emit();
  }
}
