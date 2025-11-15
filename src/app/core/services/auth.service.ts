import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { BASE_URL } from '../../core/constants/base-url';

export interface InitRequest {
  max_id: number;
  name: string;
  surname: string;
  avatar_url: string;
}

export interface UserProfile {
  id: number;
  max_id: number;
  username: string;
  avatar_url: string;
  coins: number;
  best_streak: number;
  act_char_id: number;
  characters: Array<{ character_id: number; exp: number; level: number; user_id: number; }>;
  musics: Array<{ music_id: number; user_id: number; }>;
}

export interface InitResponse {
  access_token: string;
  profile: UserProfile;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  readonly tokenSignal = signal<string | null>(null);
  readonly userSignal = signal<UserProfile | null>(null);

  async init(maxId: number, name: string, surname: string, avatarUrl: string): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.post<InitResponse>(`${BASE_URL}/api/auth/init`, {
          max_id: maxId,
          name,
          surname,
          avatar_url: avatarUrl
        } as InitRequest)
      );

      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user_profile', JSON.stringify(response.profile));
      this.tokenSignal.set(response.access_token);
      this.userSignal.set(response.profile);
      console.log('✅ Auth init successful:', response.profile);
    } catch (error) {
      console.error('❌ Auth init failed:', error);
      throw error;
    }
  }

  getToken(): string | null {
    return this.tokenSignal() || localStorage.getItem('access_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_profile');
    this.tokenSignal.set(null);
    this.userSignal.set(null);
  }

  loadFromStorage(): void {
    const token = localStorage.getItem('access_token');
    const profile = localStorage.getItem('user_profile');
    if (token) {
      this.tokenSignal.set(token);
    }
    if (profile) {
      this.userSignal.set(JSON.parse(profile));
    }
  }
}
