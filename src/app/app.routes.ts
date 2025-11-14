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
  // {
  //   path: 'session',
  //   loadComponent: () => import('./features/session/session.component').then((m) => m.SessionComponent),
  // },
  // {
  //   path: 'break',
  //   loadComponent: () => import('./features/break/break.component').then((m) => m.BreakComponent),
  // },
  // {
  //   path: 'currency',
  //   loadComponent: () => import('./features/currency/currency.component').then((m) => m.CurrencyComponent),
  // },
  // {
  //   path: 'music',
  //   loadComponent: () => import('./features/music/music.component').then((m) => m.MusicComponent),
  // },
  {
    path: '**',
    redirectTo: 'home',
  },
];
