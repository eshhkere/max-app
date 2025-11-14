import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MusicTrack } from '../../../core/models/music.model';

@Component({
  selector: 'app-music-menu',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './music-menu.component.html',
  styleUrls: ['./music-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MusicMenuComponent {
  @Input() tracks: MusicTrack[] = [];
  @Input() activeTrackId: string | null = null;

  @Output() previewRequested = new EventEmitter<MusicTrack>();
  @Output() trackSelected = new EventEmitter<MusicTrack>();
  @Output() unlockRequested = new EventEmitter<MusicTrack>();

  onPreview(track: MusicTrack): void {
    this.previewRequested.emit(track);
  }

  onSelect(track: MusicTrack): void {
    this.trackSelected.emit(track);
  }

  onUnlock(track: MusicTrack): void {
    this.unlockRequested.emit(track);
  }
}

