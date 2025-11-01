import { Component, inject, signal, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';

import { EventCardComponent } from '../../shared/ui/event-card/event-card.component';
import { ApiService } from '../../core/services/api.service';
import { adaptEvent } from '../../core/adapters/event.adapter';
import { EventVM } from '../../core/models/event.vm';
import { EventDTO } from '../../core/models/event.dto';

type PageResponse<T> = {
  data: T[];
  total: number;
  page: number;
  perPage: number;
};

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [
    NgIf, NgFor,
    EventCardComponent, MatPaginatorModule, MatProgressSpinnerModule
  ],
  templateUrl: './events.page.html',
  styleUrls: ['./events.page.scss']
})
export class EventsPage {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);

  loading = signal(true);
  items   = signal<EventVM[]>([]);
  total   = signal(0);
  page    = signal(1);
  perPage = signal(12);

  currentFilters = signal<Record<string, string>>({});

  constructor() {
    effect(() => {
      const qp = this.route.snapshot.queryParamMap;
      const filters: Record<string, string> = {};
      qp.keys.forEach(k => {
        const v = qp.get(k);
        if (v) filters[k] = v;
      });
      this.currentFilters.set(filters);
      this.page.set(Number(qp.get('page') ?? 1));
      this.load();
    });
  }

  async load() {
    this.loading.set(true);
    try {
      const res = await firstValueFrom(
        this.api.searchEvents({
          ...this.currentFilters(),
          page: String(this.page()),
          perPage: String(this.perPage())
        })
      );
      const page: PageResponse<EventDTO> = res;
      this.items.set(page.data.map(adaptEvent));
      this.total.set(page.total);
      if (page.perPage) this.perPage.set(page.perPage);
    } finally {
      this.loading.set(false);
    }
  }

  pageChange(e: PageEvent) {
    const page = e.pageIndex + 1;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { ...this.currentFilters(), page },
      queryParamsHandling: 'merge'
    });
  }
}
