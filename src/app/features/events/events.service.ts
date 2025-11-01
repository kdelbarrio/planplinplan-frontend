import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { adaptEvent } from '../../core/adapters/event.adapter';
import { EventVM } from '../../core/models/event.vm';
import { finalize } from 'rxjs';

export interface EventFilters {
  q?: string;
  from?: string;
  to?: string;
  territory?: string;
  municipality?: string;
  type?: number;
  minAge?: number;
  maxAge?: number;
  page?: number;
  per_page?: number;
  indoor?: boolean;
}

interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class EventsService {
  private api = inject(ApiService);

  readonly filters = signal<EventFilters>({ page: 1, per_page: 50 });
  readonly loading = signal(false);
  readonly total = signal(0);
  readonly events = signal<EventVM[]>([]);
  readonly meta = signal<PaginationMeta | null>(null);

  // Computed values para la paginación
  readonly page = computed(() => this.meta()?.current_page ?? 1);
  readonly lastPage = computed(() => this.meta()?.last_page ?? 1);
  readonly perPage = computed(() => this.meta()?.per_page ?? 50);
  readonly hasNextPage = computed(() => this.page() < this.lastPage());
  readonly hasPrevPage = computed(() => this.page() > 1);

/*  constructor() {
    effect(() => {
      const f = this.filters();
      this.loading.set(true);
      this.api.searchEvents(this.toApiParams(f))
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe(res => {
          this.total.set(res.total);
          
          this.events.set(res.data.map(adaptEvent));
        });
    });
  }
  */

    constructor() {
    effect(() => {
      const f = this.filters();
      this.loading.set(true);
      this.api.searchEvents(this.toApiParams(f))
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe(res => {
          this.total.set(res.total);
          this.meta.set({
            current_page: res.page,
            last_page: Math.ceil(res.total / (res.perPage || 50)),
            from: ((res.page - 1) * res.perPage) + 1,
            to: Math.min(res.page * res.perPage, res.total),
            per_page: res.perPage,
            total: res.total
          });
          this.events.set(res.data.map(adaptEvent));
        });
    });
  }

  setFilters(partial: Partial<EventFilters>) {
    this.filters.update(f => ({ ...f, ...partial, page: 1 }));
  }

  goToPage(page: number) {
    this.filters.update(f => ({ ...f, page }));
  }

  private toApiParams(f: EventFilters) {
    return {
      q: f.q,
      starts_from: f.from,
      starts_to: f.to,
      territory: f.territory,
      municipality: f.municipality,
      event_type_id: f.type,
      age_min: f.minAge,
      age_max: f.maxAge,
      is_indoor: f.indoor,
      page: f.page ?? 1,
      per_page: f.per_page ?? 50   // <-- añadido
    };
  }
}
