import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'history',
    loadComponent: () =>
      import('../app/features/history/history.component').then((m) => m.HistoryComponent),
  },
  {
    path: 'statistics',
    loadComponent: () => import('../app/features/statistics/statistics.component').then(m => m.StatisticsComponent),
  },
  {
    path: 'group',
    loadComponent: () =>
      import('../app/features/group-page/group-page.component').then(m => m.GroupPageComponent),
  },
  // {
  //   path: 'music',
  //   loadComponent: () => import('./features/music/music.component').then((m) => m.MusicComponent),
  // },
  {
    path: '**',
    redirectTo: 'home',
  },
];
