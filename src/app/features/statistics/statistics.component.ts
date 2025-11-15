import { Component, signal, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { CalendarComponent } from '../../shared/components/calendar/calendar.component';
import { SidebarMenuComponent } from '../../shared/components/sidebar-menu/sidebar-menu.component';
import { StatsService } from '../../core/services/stats.service';
import { Router } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import {
  ApexChart,
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexTooltip,
  ApexAxisChartSeries,
  ApexXAxis
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  colors: string[];
  tooltip: ApexTooltip;
  responsive: ApexResponsive[];
  legend?: any;
  plotOptions?: any;
  dataLabels?: any;
};

type Period = 'day' | 'week' | 'month';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, NgIf, CalendarComponent, SidebarMenuComponent, SharedModule],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {
  activeMode = signal<Period>('day');
  showSidebarMenu = false;

  // выбранная опорная дата (для всех режимов)
  selectedDate: Date = new Date();
  selectedDateISO: string = this.formatDate(this.selectedDate);
  stats: any = null;

  todayLabel: string = '';
  currentStreak: number = 0;
  bestStreak: number = 0;
  avgDurationMinutes: number = 0;

  // диапазон недели для заголовка при режиме "Неделя"
  weekRangeLabel: string = '';

  // подпись месяца для режима "Месяц"
  monthLabel: string = '';

  // Моки для отладки фокуса (24/7/31)
  private useMockFocusForDebug = false;

  // Маппинг id тега -> русское название
  private readonly TAG_LABELS: Record<string, string> = {
    study: 'Учёба',
    work: 'Работа',
    sport: 'Спорт',
    relax: 'Отдых',
    other: 'Другое'
  };

  // Причины срывов (donut)
  public pieChartOptions: ChartOptions = {
    series: [],
    chart: { type: 'donut', height: 180 },
    labels: [],
    colors: ['#b574ff', '#ff9a3b', '#5ad0c3', '#3aa4ff', '#ffe85c'],
    tooltip: { enabled: true, fillSeriesColor: false },
    responsive: [],
    legend: { show: false },
    plotOptions: {
      pie: {
        startAngle: -90,
        endAngle: 270,
        donut: { size: '75%' },
        expandOnClick: false
      }
    },
    dataLabels: { enabled: false }
  };

  // Топ теги (donut)
  public tagsChartOptions: ChartOptions = {
    series: [],
    chart: { type: 'donut', height: 180 },
    labels: [],
    colors: ['#59c895', '#ffd74a', '#ff90c7', '#599af5', '#a18aff'],
    tooltip: { enabled: true, fillSeriesColor: false },
    responsive: [],
    legend: { show: false },
    plotOptions: {
      pie: {
        startAngle: -90,
        endAngle: 270,
        donut: { size: '75%' },
        expandOnClick: false
      }
    },
    dataLabels: { enabled: false }
  };

  // Время фокуса (bar)
  public focusBarSeries: ApexAxisChartSeries = [];
  public focusBarChart: ApexChart = {
    type: 'bar',
    height: 180,
    toolbar: { show: false }
  };
  public focusBarXAxis: ApexXAxis = {
    categories: [],
    labels: {
      style: {
        colors: '#666',
        fontSize: '12px'
      }
    },
    axisBorder: { show: false },
    axisTicks: { show: false }
  };
  public focusBarColors: string[] = [
    '#cfcfd4',
    '#59c895',
    '#ff90c7',
    '#ffe85c',
    '#f572ff',
    '#59c895',
    '#cfcfd4'
  ];

  // 24 цвета для часов
  private readonly hourColors: string[] = [
    '#cfcfd4', '#9ad0f5', '#59c895', '#ff90c7', '#ffe85c', '#f572ff',
    '#a18aff', '#ffb37a', '#7ad9c0', '#f9a8d4', '#facc15', '#fb7185',
    '#60a5fa', '#34d399', '#a855f7', '#f97316', '#4ade80', '#22c55e',
    '#2dd4bf', '#38bdf8', '#818cf8', '#e879f9', '#fbbf24', '#9ca3af'
  ];

  public focusBarPlotOptions = {
    bar: {
      columnWidth: '45%',
      borderRadius: 9,
      distributed: true
    }
  };

  public focusBarDataLabels = { enabled: false };
  public focusBarGrid = { show: false };
  public focusBarLegend = { show: false };
  public focusBarYAxis = { show: false };

  constructor(
    private router: Router,
    private statsService: StatsService
  ) {}

  // форматтер YYYY-MM-DD доступен из TS и шаблона
  public formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  ngOnInit() {
    this.setDateLabel(this.selectedDate);
    this.updateMonthLabel(this.selectedDate);
    this.loadStatsForDate(this.selectedDate);
  }

  setMode(mode: Period) {
    this.activeMode.set(mode);

    if (mode === 'day') {
      this.setDateLabel(this.selectedDate);
    } else if (mode === 'week') {
      this.updateWeekLabel(this.selectedDate);
    } else if (mode === 'month') {
      this.updateMonthLabel(this.selectedDate);
    }

    this.loadStatsForDate(this.selectedDate);
  }

  // переход по неделям (используется из шаблона)
  public prevWeek(): void {
    const d = new Date(this.selectedDate);
    d.setDate(d.getDate() - 7);
    this.onDateSelected(this.formatDate(d));
  }

  public nextWeek(): void {
    const d = new Date(this.selectedDate);
    d.setDate(d.getDate() + 7);
    this.onDateSelected(this.formatDate(d));
  }

  // переход по месяцам (используется из шаблона)
  public prevMonth(): void {
    const d = new Date(this.selectedDate);
    d.setMonth(d.getMonth() - 1);
    this.selectedDate = d;
    this.selectedDateISO = this.formatDate(this.selectedDate);
    if (this.activeMode() === 'month') {
      this.updateMonthLabel(this.selectedDate);
    }
    this.loadStatsForDate(this.selectedDate);
  }

  public nextMonth(): void {
    const d = new Date(this.selectedDate);
    d.setMonth(d.getMonth() + 1);
    this.selectedDate = d;
    this.selectedDateISO = this.formatDate(this.selectedDate);
    if (this.activeMode() === 'month') {
      this.updateMonthLabel(this.selectedDate);
    }
    this.loadStatsForDate(this.selectedDate);
  }

  // выбор дня из календаря (для режима "День", но используется и при неделе)
  onDateSelected(dateIso: string) {
    this.selectedDate = new Date(dateIso);
    this.selectedDateISO = dateIso;

    if (this.activeMode() === 'day') {
      this.setDateLabel(this.selectedDate);
    } else if (this.activeMode() === 'week') {
      this.updateWeekLabel(this.selectedDate);
    } else if (this.activeMode() === 'month') {
      this.updateMonthLabel(this.selectedDate);
    }

    this.loadStatsForDate(this.selectedDate);
  }

  setDateLabel(date: Date) {
    this.todayLabel = date
      .toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'short' })
      .replace('.', '');
  }

  // подпись диапазона недели "11.11.2025 - 18.11.2025"
  private updateWeekLabel(date: Date) {
    const start = this.getWeekStart(date);
    const end = this.getWeekEnd(start);

    const fmt = (d: Date) =>
      `${d.getDate().toString().padStart(2, '0')}.` +
      `${(d.getMonth() + 1).toString().padStart(2, '0')}.` +
      `${d.getFullYear()}`;

    this.weekRangeLabel = `${fmt(start)} - ${fmt(end)}`;
  }

  // подпись месяца "Ноябрь 2025"
  private updateMonthLabel(date: Date) {
    this.monthLabel = date.toLocaleDateString('ru-RU', {
      month: 'long',
      year: 'numeric'
    });
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const jsDay = d.getDay(); // 0..6 (воск..суб)
    const diff = jsDay === 0 ? -6 : 1 - jsDay; // к понедельнику
    d.setDate(d.getDate() + diff);
    return d;
  }

  private getWeekEnd(weekStart: Date): Date {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 6); // понедельник + 6 = воскресенье
    return d;
  }

  loadStatsForDate(date: Date) {
    const period: Period = this.activeMode();

    if (period === 'week') {
      // считаем сдвиг по НЕДЕЛЯМ относительно текущей недели
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayWeekStart = this.getWeekStart(today);
      const targetWeekStart = this.getWeekStart(date);

      const diffDays = Math.floor(
        (targetWeekStart.getTime() - todayWeekStart.getTime()) / (1000 * 60 * 60 * 24)
      );
      const offset = diffDays / 7; // будет -1, 0, 1, 2 и т.п.

      this.statsService.getStats(period, offset).subscribe(res => {
        this.applyStatsResponse(res);
      });
    } else {
      // для day/month оставляем сдвиг по дням
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const target = new Date(date);
      target.setHours(0, 0, 0, 0);

      const offset = Math.floor(
        (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      this.statsService.getStats(period, offset).subscribe(res => {
        this.applyStatsResponse(res);
      });
    }
  }

  private applyStatsResponse(res: any) {
    this.stats = res.data || {};

    // KPI
    this.currentStreak = this.stats?.kpi?.current_streak ?? 0;
    this.bestStreak = this.stats?.kpi?.best_streak ?? 0;
  
    const avgSeconds = this.stats?.kpi?.avg_duration ?? 0;
    this.avgDurationMinutes = avgSeconds > 0 ? Math.round(avgSeconds / 60) : 0;

    // Причины срывов (без 'unknown')
    const rawReasons = this.stats?.charts?.fail_reasons ?? [];
    const reasons = rawReasons.filter((x: any) => x.reason !== 'unknown');
    if (!this.stats.charts) {
      this.stats.charts = {};
    }
    this.stats.charts.fail_reasons = reasons;

    if (reasons.length) {
      this.pieChartOptions.series = reasons.map((x: any) => x.count);
      this.pieChartOptions.labels = reasons.map((x: any) => x.reason);
    } else {
      this.pieChartOptions.series = [];
      this.pieChartOptions.labels = [];
    }

    // Топ теги
    const rawTags = this.stats?.charts?.tags ?? [];
    if (rawTags.length) {
      this.tagsChartOptions.series = rawTags.map((x: any) => x.count);
      this.tagsChartOptions.labels = rawTags.map((x: any) =>
        this.getTagLabel(x.tag)
      );
    } else {
      this.tagsChartOptions.series = [];
      this.tagsChartOptions.labels = [];
    }

    // Моки
    if (this.useMockFocusForDebug) {
      this.applyMockFocus(this.activeMode());
    }

    // Время фокуса
    this.buildFocusChart(this.activeMode());
  }

  // Возвращает русское название тега по id
  public getTagLabel(tagId: string): string {
    return this.TAG_LABELS[tagId] ?? tagId;
  }

  private buildFocusChart(period: Period) {
    const focus = this.stats?.charts?.focus_bar ?? [];

    if (!focus.length) {
      this.focusBarSeries = [];
      this.focusBarXAxis = { ...this.focusBarXAxis, categories: [] };
      return;
    }

    if (period === 'day') {
      const points = focus
        .map((x: any) => {
          const d = x.bucket_start ? new Date(x.bucket_start) : new Date();
          let hour: number;
          if (typeof x.label === 'string' && x.label.includes(':')) {
            hour = parseInt(x.label.slice(0, 2), 10);
          } else {
            hour = d.getHours();
          }
          const label = hour.toString().padStart(2, '0'); // "00".."23"
          return { hour, label, minutes: x.minutes as number };
        })
        .sort((a: any, b: any) => a.hour - b.hour);

      this.focusBarSeries = [
        {
          name: 'Фокус',
          data: points.map((p: { hour: number; label: string; minutes: number }) => p.minutes)
        }
      ];
      this.focusBarXAxis = {
        ...this.focusBarXAxis,
        categories: points.map((p: { hour: number; label: string; minutes: number }) => p.label),
        labels: {
          style: {
            colors: '#666',
            fontSize: '10px'
          },
          offsetY: 4,
          formatter: (value: string, index: number): string => {
            return index % 2 === 0 ? value : '';
          }
        }
      };

      this.focusBarPlotOptions = {
        bar: {
          columnWidth: '55%',
          borderRadius: 9,
          distributed: true
        }
      };

      this.focusBarColors = this.hourColors.slice(0, points.length);
    } else if (period === 'week') {
      const letters = ['П', 'В', 'С', 'Ч', 'П', 'С', 'В'];

      const points = focus
        .map((x: any) => {
          const d = new Date(x.label || x.bucket_start);
          const jsDay = d.getDay(); // 0..6 (воск..суб)
          const idx = (jsDay + 6) % 7; // 0‑пон,6‑воск
          return {
            idx,
            label: letters[idx],
            minutes: x.minutes as number
          };
        })
        .sort((a: any, b: any) => a.idx - b.idx);

      this.focusBarSeries = [
        {
          name: 'Фокус',
          data: points.map((p: { idx: number; label: string; minutes: number }) => p.minutes)
        }
      ];
      this.focusBarXAxis = {
        ...this.focusBarXAxis,
        categories: points.map((p: { idx: number; label: string; minutes: number }) => p.label),
        labels: {
          style: {
            colors: '#666',
            fontSize: '12px'
          }
        }
      };

      this.focusBarPlotOptions = {
        bar: {
          columnWidth: '55%',
          borderRadius: 9,
          distributed: true
        }
      };
      this.focusBarColors = [
        '#cfcfd4',
        '#59c895',
        '#ff90c7',
        '#ffe85c',
        '#f572ff',
        '#59c895',
        '#cfcfd4'
      ];
    } else if (period === 'month') {
      const points = focus
        .map((x: any) => {
          const d = new Date(x.label || x.bucket_start);
          const day = d.getDate();
          return { day, minutes: x.minutes as number };
        })
        .sort((a: any, b: any) => a.day - b.day);
    
      this.focusBarSeries = [
        {
          name: 'Фокус',
          data: points.map((p: { day: number; minutes: number }) => p.minutes)
        }
      ];
    
      this.focusBarXAxis = {
        ...this.focusBarXAxis,
        categories: points.map((p: { day: number; minutes: number }) => p.day.toString()),
        labels: {
          style: {
            colors: '#666',
            fontSize: '9px'  // чуть мельче, чтобы влезло
          },
          offsetY: 4,
          formatter: (value: string): string => {
            const day = parseInt(value, 10);
            // показываем только каждый второй день:
            // вариант A: нечётные (1,3,5...)
            return day % 2 === 1 ? value : '';
            // если захочешь чётные, поменяешь на day % 2 === 0
          }
        }
      };
    
      this.focusBarPlotOptions = {
        bar: {
          columnWidth: '20%', // сильно уже, чтобы уместить 31 столбик в 317px
          borderRadius: 4,
          distributed: false
        }
      };
    
      this.focusBarColors = ['#59c895'];
    }
  }    

  // Моки для focus_bar (по желанию)
  private applyMockFocus(period: Period) {
    if (!this.stats) this.stats = {};
    if (!this.stats.charts) this.stats.charts = {};

    const base = new Date(2025, 10, 10); // произвольная дата

    if (period === 'week') {
      const weekData: any[] = [];
      const monday = this.getWeekStart(base);
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const minutes = 20 + (i * 13) % 60;
        weekData.push({
          bucket_start: d.toISOString(),
          label: d.toISOString().slice(0, 10),
          minutes
        });
      }
      this.stats.charts.focus_bar = weekData;
    }
  }

  onMenuClick() {
    this.showSidebarMenu = true;
  }

  onMenuClosed() {
    this.showSidebarMenu = false;
  }

  onMenuItemSelected(itemId: string) {
    if (itemId === 'home') {
      this.router.navigate(['/home']);
    } else if (itemId === 'history') {
      this.router.navigate(['/history']);
    } else if (itemId === 'statistics') {
      this.router.navigate(['/statistics']);
    } else if (itemId === 'group') {
      this.router.navigate(['/group']);
    }
  
    this.showSidebarMenu = false;
  }
  
}
