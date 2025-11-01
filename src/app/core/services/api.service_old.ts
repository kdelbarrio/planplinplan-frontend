import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EventDTO } from '../models/event.dto';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  searchEvents(filters: Record<string, any>): Observable<{ data: EventDTO[]; total: number; page: number; }> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params = params.set(k, v as any);
    });
    return this.http.get<{ data: EventDTO[]; total: number; page: number; }>('events', { params });
  }

  getEvent(id: number): Observable<EventDTO> {
    // Acepta ambas respuestas: { data: EventDTO } o EventDTO y devuelve siempre EventDTO sin wrapper
    return this.http.get<EventDTO | { data: EventDTO }>(`events/${id}`)
      .pipe(map(res => (res as any).data ?? res as EventDTO));
  }
}
