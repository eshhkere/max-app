import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BASE_URL } from '../../core/constants/base-url';

@Injectable({ providedIn: 'root' })
export class HistoryService {
  constructor(private http: HttpClient) {}


  getHistory(date: string) {
    return this.http.post<{ data: any[] }>(`${BASE_URL}/api/history`, { date });
  }
}
