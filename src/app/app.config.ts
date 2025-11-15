import { ApplicationConfig, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { APP_ROUTES } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

// ВАЖНО: registerLocaleData из @angular/common
import { registerLocaleData } from '@angular/common';
import localeRu from '@angular/common/locales/ru';

// регистрируем данные локали один раз
registerLocaleData(localeRu, 'ru-RU');

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(APP_ROUTES),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    { provide: LOCALE_ID, useValue: 'ru-RU' } // делаем ru-RU локалью по умолчанию
  ]
};
