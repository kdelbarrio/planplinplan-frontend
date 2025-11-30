import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface LastPlan {
  id: number | string;
  title: string;
  city: string;
  date: string;   // ISO YYYY-MM-DD
  image: string | null;
}

@Injectable({ providedIn: 'root' })
export class IndoorEventsService {
  private http = inject(HttpClient);
  private readonly endpoint = '/events';

  // Devuelve los N eventos indoor más próximos a hoy
  getNearestIndoorEvents(limit = 5): Observable<LastPlan[]> {
    const params = this.buildQueryParams({
      is_indoor: '1',
      from: this.todayISO(),
      per_page: String(50),
      page: '1',
    });

    return this.fetchEvents(params).pipe(
      map(events => this.filterUpcoming(events).sort(this.compareByStartDate).slice(0, limit)),
      map(list => list.map(this.toLastPlan)),
      catchError(() => of([]))
    );
  }

  // Devuelve eventos indoor según filtros pasados (municipio, fechas, paginación...)
  getIndoorEvents(filters: {
    indoorOnly?: boolean;
    municipality?: string;
    from?: string;
    to?: string;
    page?: number;
    per_page?: number;
  } = {}): Observable<LastPlan[]> {
    const params = this.buildQueryParams({
      ...(filters.indoorOnly ? { is_indoor: '1' } : {}),
      ...(filters.municipality ? { municipality: String(filters.municipality) } : {}),
      ...(filters.from ? { from: String(filters.from) } : {}),
      ...(filters.to ? { to: String(filters.to) } : {}),
      ...(filters.page ? { page: String(filters.page) } : { page: '1' }),
      ...(filters.per_page ? { per_page: String(filters.per_page) } : { per_page: '50' }),
    });

    return this.fetchEvents(params).pipe(
      map(events => events.sort(this.compareByStartDate)),
      map(list => list.map(this.toLastPlan)),
      catchError(() => of([]))
    );
  }

  // --- Helpers
  private buildQueryParams(values: Record<string, any>): HttpParams {
    let params = new HttpParams();
    Object.entries(values).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return;
      params = params.set(k, String(v));
    });
    return params;
  }

  private fetchEvents(params: HttpParams): Observable<any[]> {
    return this.http.get<any>(this.endpoint, { params }).pipe(
      map(res => Array.isArray(res) ? res : (res?.data ?? []))
    );
  }

  private todayISO(): string {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
  }

  private filterUpcoming(items: any[]): any[] {
    const from = new Date(this.todayISO() + 'T00:00:00');
    return items.filter(e => {
      const s = e.starts_at ?? e.date;
      if (!s) return false;
      const d = new Date(s);
      return !isNaN(d.getTime()) && d >= from;
    });
  }

  private compareByStartDate(a: any, b: any): number {
    const da = new Date(a.starts_at ?? a.date).getTime();
    const db = new Date(b.starts_at ?? b.date).getTime();
    return da - db;
  }

  private toLastPlan(e: any): LastPlan {
    return {
      id: e.id,
      title: e.title ?? e.name ?? '',
      city: e.municipality ?? e.city ?? '',
      date: (e.starts_at ?? e.date ?? '').slice(0, 10),
      image: e.image_url ?? e.cover ?? null
    };
  }
}