import { Component, EventEmitter, Output } from '@angular/core';

interface InternalTrack {
  id: string;
  title: string;
  src: string;
}

@Component({
  selector: 'app-music-menu',
  standalone: true,
  templateUrl: './music-menu.component.html',
  styleUrls: ['./music-menu.component.scss'],
})
export class MusicMenuComponent {
  @Output() closed = new EventEmitter<void>();
  @Output() trackSelected = new EventEmitter<string | null>();

  tracks: InternalTrack[] = [
    { id: 'les',    title: 'Лес',        src: '/assets/music/les.mp3' },
    { id: 'lofi',   title: 'Lo-fi',      src: '/assets/music/lofi.mp3' },
    { id: 'oblaka', title: 'Облака',     src: '/assets/music/oblaka.mp3' },
    { id: 'rain',   title: 'Дождь',      src: '/assets/music/rain.mp3' },
    { id: 'white',  title: 'Белый шум',  src: '/assets/music/white.mp3' },
  ];

  activeTrackId: string | null = null;
  private audio: HTMLAudioElement | null = null;

  onClose(): void {
    this.stopAudio();
    this.closed.emit();
  }

  onToggleTrack(track: InternalTrack): void {
    if (this.activeTrackId === track.id) {
      // пауза
      this.stopAudio();
      this.activeTrackId = null;
      this.trackSelected.emit(null);
      return;
    }

    // запуск нового трека
    this.stopAudio();
    this.audio = new Audio(track.src);
    this.audio.loop = true;

    const playPromise = this.audio.play();
    if (playPromise) {
      playPromise.catch(err => {
        console.warn('[MusicMenu] autoplay blocked', err);
      });
    }

    this.activeTrackId = track.id;
    this.trackSelected.emit(track.id);
  }

  private stopAudio(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio = null;
    }
  }
}
