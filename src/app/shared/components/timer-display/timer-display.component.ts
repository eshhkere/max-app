import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-timer-display',
  standalone: true,
  imports: [],
  templateUrl: './timer-display.component.html',
  styleUrls: ['./timer-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimerDisplayComponent {
  @Input() remainingMs = 0;
  @Input() statusLabel = 'Idle';
}

