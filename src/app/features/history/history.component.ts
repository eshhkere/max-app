import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryService } from '../../core/services/history.service';
import { TagService } from '../../core/services/tag.service';
import { SidebarMenuComponent } from '../../shared/components/sidebar-menu/sidebar-menu.component';
import { CalendarComponent } from '../../shared/components/calendar/calendar.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, CalendarComponent, SidebarMenuComponent],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnInit {
  sessions: any[] = [];
  showSidebarMenu = false;

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  

  currentMonth: Date = new Date();
  selectedDate: Date = new Date();
  selectedDateISO: string = this.formatDate(this.selectedDate);

  constructor(
    private historyService: HistoryService,
    private tagService: TagService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadHistory(this.selectedDateISO);
  }

  loadHistory(date: string) {
    this.historyService.getHistory(date).subscribe(result => {
      this.sessions = result.data;
    });
  }

  onDateSelected(dateIso: string) {
    this.selectedDateISO = dateIso;
    this.selectedDate = new Date(dateIso);
    this.currentMonth = new Date(dateIso);
    this.loadHistory(dateIso);
  }


  getTagInfo(tag: string) {
    const found = this.tagService.availableTags.find(t => t.id === tag);
    return found ? found : { emoji: '❓', label: tag };
  }

  onMenuClick() { this.showSidebarMenu = true }
  onMenuClosed() { this.showSidebarMenu = false }
  onMenuItemSelected(itemId: string) {
    if (itemId === 'home') {
      this.router.navigate(['/home']);
    } else if (itemId === 'statistics') {
      this.router.navigate(['/statistics']);
    } else if (itemId === 'history') {
      this.router.navigate(['/history']);
    }
    this.showSidebarMenu = false;
  }
}
