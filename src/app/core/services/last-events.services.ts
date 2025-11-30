import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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
    const params = new HttpParams().set('per_page', String(Math.max(1, limit)));
    return this.http.get<any>('/events', { params }).pipe(
      map(res => {
        const items: any[] = Array.isArray(res) ? res : (res?.data ?? []);

        // Ordenar por id de forma descendente (aseguramos que compare números)
        const sorted = items.slice().sort((a: any, b: any) => {
          const ai = Number(a?.id ?? 0);
          const bi = Number(b?.id ?? 0);
          return bi - ai; // descendente
        });

        return sorted.slice(0, limit).map((e: any) => ({
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