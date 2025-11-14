import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { MusicMenuComponent } from '../../shared/components/music-menu/music-menu.component';
import { MusicService } from '../../core/services/music.service';
import { CurrencyService } from '../../core/services/currency.service';

@Component({
  selector: 'app-music',
  standalone: true,
  imports: [HeaderComponent, MusicMenuComponent],
  templateUrl: './music.component.html',
  styleUrls: ['./music.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MusicComponent {
  private readonly musicService = inject(MusicService);
  private readonly currencyService = inject(CurrencyService);

  readonly tracks = this.musicService.tracks;
  readonly activeTrack = this.musicService.activeTrack;
  readonly balance = this.currencyService.balance;
  readonly progress = this.currencyService.levelProgress;

  onPreview(trackId: string): void {
    // TODO: hook into audio subsystem
    this.musicService.selectTrack(trackId);
  }

  onSelect(trackId: string): void {
    this.musicService.selectTrack(trackId);
  }

  onUnlock(trackId: string): void {
    this.musicService.unlockTrack(trackId);
  }
}

