import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { ReasonCode } from '../models/session.model'; // ← Добавь

const STORAGE_KEYS = {
  user: 'max-focus:user',
  giveUpReason: 'max-focus:give-up-reason',
  settings: 'max-focus:settings',
} as const;

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  getUser(): User | null {
    const raw = localStorage.getItem(STORAGE_KEYS.user);
    return raw ? (JSON.parse(raw) as User) : null;
  }

  setUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  }

  getLastGiveUpReason(): ReasonCode | null {
    return (localStorage.getItem(STORAGE_KEYS.giveUpReason) as ReasonCode | null) ?? null;
  }

  setLastGiveUpReason(reason: ReasonCode): void {
    localStorage.setItem(STORAGE_KEYS.giveUpReason, reason);
  }

  clear(): void {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  }
}
