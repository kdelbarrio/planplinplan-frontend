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

    // Endpoint relativo; si usas base URL/interceptor, no hace falta prefijo '/api'
    return this.http.get<PageResponse<EventDTO>>('events', { params });
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
