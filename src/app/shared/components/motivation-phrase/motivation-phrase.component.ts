import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-motivation-phrase',
  standalone: true,
  template: `
    <div class="motivation-phrase">
      {{ phrase }}
    </div>
  `,
  styleUrls: ['./motivation-phrase.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MotivationPhraseComponent {
  @Input() phrase: string = ''; // Принимаем просто строку
}
