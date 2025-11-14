import { Injectable, computed, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MusicTrack } from '../models/music.model';

// Музыка прямо в сервисе (не нужны константы)
const MUSIC_LIBRARY: MusicTrack[] = [
  { id: 'forest-hum', title: 'Звуки леса', artist: 'Max Ensemble', durationSeconds: 180, unlocked: true },
  { id: 'rainy-focus', title: 'Дождь для фокуса', artist: 'Max Ensemble', durationSeconds: 240, unlocked: false },
  { id: 'night-owl', title: 'Ночная сова', artist: 'Max Ensemble', durationSeconds: 210, unlocked: false },
];

@Injectable({
  providedIn: 'root',
})
export class MusicService {
  private readonly tracksSignal = signal<MusicTrack[]>(MUSIC_LIBRARY);
  private readonly activeTrackIdSignal = signal<string | null>(null);
  private readonly isPlayingSignal = signal<boolean>(false);

  private readonly activeTrackSubject = new BehaviorSubject<MusicTrack | null>(null);

  readonly tracks = computed(() => this.tracksSignal());
  readonly activeTrack = computed(() => {
    const id = this.activeTrackIdSignal();
    return this.tracksSignal().find((track) => track.id === id) ?? null;
  });
  readonly isPlaying = this.isPlayingSignal.asReadonly();
  readonly activeTrack$ = this.activeTrackSubject.asObservable();

  selectTrack(trackId: string): void {
    this.activeTrackIdSignal.set(trackId);
    const track = this.tracksSignal().find((item) => item.id === trackId) ?? null;
    this.activeTrackSubject.next(track);
  }

  togglePlayback(): void {
    this.isPlayingSignal.update((value) => !value);
  }

  unlockTrack(trackId: string): void {
    this.tracksSignal.update((tracks) =>
      tracks.map((track) => (track.id === trackId ? { ...track, unlocked: true } : track)),
    );
  }
}
