import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="app-shell">
      <router-outlet></router-outlet>
    </div>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  private readonly auth = inject(AuthService);

  async ngOnInit() {
    // Сообщаем MAX что приложение готово
    if (window.WebApp) {
      window.WebApp.ready();
      console.log('✅ MAX WebApp initialized');
      console.log('Platform:', window.WebApp.platform);
      console.log('Version:', window.WebApp.version);
    }

    // ❌ УБРАЛИ: this.auth.loadFromStorage();
    
    // ✅ ВСЕГДА вызываем init при запуске
    console.log('🔑 Initializing authentication...');
    
    const initData = this.getMaxUserData();
    
    await this.auth.init(
      initData.maxId,
      initData.name,
      initData.surname,
      initData.avatarUrl
    );
    
    console.log('✅ Authentication complete');
  }

  private getMaxUserData(): {
    maxId: number;
    name: string;
    surname: string;
    avatarUrl: string;
  } {
    if (window.WebApp?.initDataUnsafe?.user) {
      const user = window.WebApp.initDataUnsafe.user;
      return {
        maxId: user.id,
        name: user.first_name,
        surname: user.last_name || '',
        avatarUrl: user.photo_url || ''
      };
    }

    console.warn('⚠️ MAX WebApp not detected, using mock data');
    return {
      maxId: 5230,
      name: 'Федор',
      surname: 'Безруков',
      avatarUrl: ''
    };
  }
}