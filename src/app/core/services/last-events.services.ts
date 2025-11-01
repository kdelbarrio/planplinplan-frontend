import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, of } from 'rxjs';

export interface LastPlan {
  id: number | string;
  title: string;
  city: string;
  date: string;   // ISO YYYY-MM-DD
  image: string | null;
}

@Injectable({ providedIn: 'root' })
export class LastPlansService {
  private http = inject(HttpClient);

  getLatest(limit = 5) {
    return this.http.get<any>('/events').pipe(
      map(res => {
        
        const items: any[] = Array.isArray(res) ? res : (res?.data ?? []);
        return items.slice(0, limit).map((e: any) => ({
          id: e.id,
          title: e.title ?? e.name,
          city: e.city ?? e.municipality ?? '',
          date: e.date ?? e.starts_at?.slice(0, 10) ?? '',
          image: e.image ?? e.cover ?? null
        })) as LastPlan[];
      }),
      catchError(() => of([] as LastPlan[]))
    );
  }
}
