import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BASE_URL } from '../../core/constants/base-url';

@Injectable({ providedIn: 'root' })
export class StatsService {
  constructor(private http: HttpClient) {}

  // period: 'day' | 'week' | 'month'
  getStats(period: string, offset: number) {
    return this.http.post<{ data: any }>(`${BASE_URL}/api/stats`, { period, offset });
  }
}
