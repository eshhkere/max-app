import { NgFor } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';

export interface MenuItem {
  id: string;
  label: string;
  icon: string; // SVG path или emoji
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'home', label: 'Главная страница', icon: 'home' },
  { id: 'statistics', label: 'Статистика', icon: 'statistics' },
  { id: 'history', label: 'История', icon: 'history' },
  { id: 'group', label: 'Групповая сессия', icon: 'group' },
  { id: 'hero', label: 'Выбор героя', icon: 'hero' },
];

@Component({
  selector: 'app-sidebar-menu',
  standalone: true,
  imports: [NgFor],
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarMenuComponent {
  @Output() closed = new EventEmitter<void>();
  @Output() itemSelected = new EventEmitter<string>();

  readonly menuItems = MENU_ITEMS;

  onClose(): void {
    this.closed.emit();
  }

  onItemClick(itemId: string): void {
    this.itemSelected.emit(itemId);
    this.closed.emit();
  }
  

  getIconSvg(icon: string): string {
    const icons: Record<string, string> = {
      home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
      statistics: 'M16 11V3H8v6H2v12h20V11h-6zm-6-6h2v14h-2V5zm-6 6h2v8H4v-8zm12 8h-2v-8h2v8z',
      history: 'M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z',
      group: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
      hero: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z',
    };
    return icons[icon] || icons['home'];
  }

  
}
