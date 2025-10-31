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
}

@Injectable({ providedIn: 'root' })
export class EventsService {
  private api = inject(ApiService);

  readonly filters = signal<EventFilters>({ page: 1 });
  readonly loading = signal(false);
  readonly total = signal(0);
  readonly events = signal<EventVM[]>([]);
  readonly page = computed(() => this.filters().page ?? 1);

  constructor() {
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
      page: f.page ?? 1
    };
  }
}
