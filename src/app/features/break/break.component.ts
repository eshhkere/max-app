import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { TimerDisplayComponent } from '../../shared/components/timer-display/timer-display.component';
import { IconButtonComponent } from '../../shared/components/icon-button/icon-button.component';
import { SessionService } from '../../core/services/session.service';
import { TimerService } from '../../core/services/timer.service';
import { CurrencyService } from '../../core/services/currency.service';

@Component({
  selector: 'app-break',
  standalone: true,
  imports: [HeaderComponent, TimerDisplayComponent, IconButtonComponent],
  templateUrl: './break.component.html',
  styleUrls: ['./break.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreakComponent {
  private readonly sessionService = inject(SessionService);
  private readonly timerService = inject(TimerService);
  private readonly currencyService = inject(CurrencyService);

  readonly remainingMs = this.timerService.remainingMs;
  readonly balance = this.currencyService.balance;
  readonly progress = this.currencyService.levelProgress;

  onEndBreak(): void {
    this.sessionService.completeSession();
  }
}

