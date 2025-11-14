import { NgFor } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { ProgressBarComponent } from '../../shared/components/progress-bar/progress-bar.component';
import { CurrencyService } from '../../core/services/currency.service';

@Component({
  selector: 'app-currency',
  standalone: true,
  imports: [NgFor, HeaderComponent, ProgressBarComponent],
  templateUrl: './currency.component.html',
  styleUrls: ['./currency.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencyComponent {
  private readonly currencyService = inject(CurrencyService);

  readonly balance = this.currencyService.balance;
  readonly progress = this.currencyService.levelProgress;

  readonly rewardsPreview = [
    { id: 'daily', label: 'Daily focus streak', reward: '+25' },
    { id: 'session', label: 'Recent focus session', reward: '+15' },
  ];
}

