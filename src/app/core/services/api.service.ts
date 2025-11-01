// src/app/core/services/api.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EventDTO } from '../models/event.dto';


type PageResponse<T> = {
  data: T[];
  total: number;
  page: number;
  perPage: number;
};

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  /**
   * Busca eventos con filtros y paginación.
   * Pasa los filtros tal cual (q, date, place, type, minAge, maxAge, a11y, indoor, page, perPage).
   * - Booleans se envían como '1'
   * - Date se envía como 'YYYY-MM-DD'
   */
  searchEvents(filters: Record<string, any>): Observable<PageResponse<EventDTO>> {
    let params = new HttpParams();

    Object.entries(filters).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return;

      // Normaliza tipos típicos: boolean y Date
      if (typeof v === 'boolean') {
        params = params.set(k, v ? '1' : '0');
      } else if (v instanceof Date) {
        // API-friendly date
        params = params.set(k, v.toISOString().slice(0, 10)); // YYYY-MM-DD
      } else {
        params = params.set(k, String(v));
      }
    });

    // Correccion para paginacion
    //return this.http.get<PageResponse<EventDTO>>('events', { params });
    return this.http.get<any>('events', { params }).pipe(
      map(res => {
        // Laravel-style: { data: [...], meta: { total, current_page, per_page, ... } }
        if (res && res.meta) {
          return {
            data: res.data ?? [],
            total: Number(res.meta.total ?? 0),
            page: Number(res.meta.current_page ?? 1),
            perPage: Number(res.meta.per_page ?? res.meta.perPage ?? 50)
          } as PageResponse<EventDTO>;
        }

        // Already legacy-shaped
        if (res && 'total' in res && 'page' in res && 'perPage' in res) {
          return res as PageResponse<EventDTO>;
        }

        // Fallback: infer values
        return {
          data: res.data ?? (Array.isArray(res) ? res : []),
          total: Number(res.total ?? (res.data?.length ?? 0)),
          page: Number(res.page ?? 1),
          perPage: Number(res.perPage ?? res.per_page ?? 50)
        } as PageResponse<EventDTO>;
      })
    );



  }

  /**
   * Obtiene un evento por id.
   * Acepta ambas respuestas: { data: EventDTO } o EventDTO y devuelve siempre EventDTO.
   */
  getEvent(id: number): Observable<EventDTO> {
    return this.http
      .get<EventDTO | { data: EventDTO }>(`events/${id}`)
      .pipe(map((res) => (res as any).data ?? (res as EventDTO)));
  }
}
