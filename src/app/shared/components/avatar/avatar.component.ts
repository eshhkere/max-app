import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

@Component({
  selector: 'app-avatar',
  standalone: true,
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarComponent implements AfterViewInit, OnChanges {
  // путь к видео; по умолчанию нейтральный
  @Input() videoSrc: string = '/assets/videos/neutral_robot.webm';

  @ViewChild('videoEl') videoRef!: ElementRef<HTMLVideoElement>;

  private hasViewInitialized = false;

  ngAfterViewInit(): void {
    this.hasViewInitialized = true;
    this.loadAndPlay();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['videoSrc'] && this.hasViewInitialized) {
      this.loadAndPlay();
    }
  }

  private loadAndPlay(): void {
    const video = this.videoRef?.nativeElement;
    if (!video) return;

    // "ленивая" загрузка: меняем src только когда нужно
    if (video.src !== this.videoSrc) {
      video.src = this.videoSrc;
    }

    // гарантируем muted+playsinline для автоплея
    video.muted = true;
    video.playsInline = true;
    video.loop = true;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.warn('[Avatar] autoplay prevented, will retry on user interaction', err);
        // можно добавить запасной вариант: показать кнопку Play, если захотите
      });
    }
  }
}
