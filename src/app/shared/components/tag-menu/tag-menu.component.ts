import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TagOption } from '../../../core/models/session.model';

@Component({
  selector: 'app-tag-menu',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './tag-menu.component.html',
  styleUrls: ['./tag-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagMenuComponent {
  @Input() tags: TagOption[] = [];
  @Input() activeTagId: string | null = null;

  @Output() tagSelected = new EventEmitter<TagOption>();
  @Output() commentChanged = new EventEmitter<string>();
  @Output() closed = new EventEmitter<void>();

  readonly comment = signal<string>('');
  readonly showTagList = signal<boolean>(false);

  toggleTagList(): void {
    this.showTagList.update(v => !v);
  }

  closeTagList(): void {
    this.showTagList.set(false);
  }

  onSelectTag(tag: TagOption): void {
    this.activeTagId = tag.id;
    this.tagSelected.emit(tag);
  }

  onCommentChange(comment: string): void {
    // Принудительно обрезаем до 40 символов
    const trimmed = comment.slice(0, 40);
    this.comment.set(trimmed);
    this.commentChanged.emit(trimmed);
  }

  onSave(): void {
    this.closed.emit();
  }

  onClose(): void {
    this.closed.emit();
  }

  getSelectedTagLabel(): string {
    const tag = this.tags.find(t => t.id === this.activeTagId);
    return tag?.label || 'Учёба';
  }

  getSelectedTagEmoji(): string {
    const tag = this.tags.find(t => t.id === this.activeTagId);
    return tag?.emoji || '🎓';
  }
}
