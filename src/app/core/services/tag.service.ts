import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TagOption } from '../models/session.model';

const DEFAULT_TAGS: TagOption[] = [
  { id: 'study', label: 'Учёба', icon: 'book', emoji: '🎓' },
  { id: 'work', label: 'Работа', icon: 'briefcase', emoji: '💼' },
  { id: 'sport', label: 'Спорт', icon: 'fitness', emoji: '💪' },
  { id: 'relax', label: 'Отдых', icon: 'heart', emoji: '🎪' },
  { id: 'other', label: 'Другое', icon: 'star', emoji: '🎨' },
];


@Injectable({
  providedIn: 'root',
})
export class TagService {

  
  private readonly activeTagSignal = signal<TagOption | null>(DEFAULT_TAGS[0]); // По умолчанию "Учёба"
  private readonly commentSignal = signal<string>('');

  private readonly tagSubject = new BehaviorSubject<TagOption | null>(DEFAULT_TAGS[0]);

  readonly activeTag = this.activeTagSignal.asReadonly();
  readonly comment = this.commentSignal.asReadonly();
  readonly activeTag$ = this.tagSubject.asObservable();
  readonly availableTags = DEFAULT_TAGS; // Доступные теги

  setActiveTag(tag: TagOption | null): void {
    this.activeTagSignal.set(tag);
    this.tagSubject.next(tag);
  }

  updateComment(comment: string): void {
    this.commentSignal.set(comment);
  }

  clear(): void {
    this.setActiveTag(DEFAULT_TAGS[0]);
    this.commentSignal.set('');
  }
}
