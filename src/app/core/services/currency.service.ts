import { Injectable, inject, signal, computed } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private readonly auth = inject(AuthService);

  readonly balance = signal<number>(0);
  readonly levelProgress = signal<number>(0); // ← Добавил

  constructor() {
    const profile = this.auth.userSignal();
    if (profile) {
      this.balance.set(profile.coins);
    }
  }

  addCoins(amount: number): void {
    this.balance.update(current => current + amount);
  }

  spendCoins(amount: number): boolean {
    if (this.balance() >= amount) {
      this.balance.update(current => current - amount);
      return true;
    }
    return false;
  }
}
