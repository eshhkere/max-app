import { Component } from '@angular/core';
import { MusicMenuComponent } from '../../shared/components/music-menu/music-menu.component';

@Component({
  selector: 'app-music',
  standalone: true,
  imports: [MusicMenuComponent],
  templateUrl: './music.component.html',
  styleUrls: ['./music.component.scss'],
})
export class MusicComponent {
  onTrackSelected(trackId: string | null): void {
    console.log('music page selected track:', trackId);
  }

  onClosed(): void {
    console.log('music menu closed');
  }
}
