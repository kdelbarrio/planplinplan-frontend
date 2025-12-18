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
import { MatIcon } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';

// usamos toSignal para escuchar cambios en query params
import { toSignal } from '@angular/core/rxjs-interop';

type PageResponse<T> = {
  data: T[];
  total: number;
  page: number;
  perPage: number;
};

type Chip = { key: string; value?: string; text: string };

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [
    NgIf, NgFor,
    EventCardComponent,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatIcon,
    MatDividerModule,
    MatChipsModule, 
    MatButtonModule
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

  // Siempre refleja lo que hay en la URL
  currentFilters = signal<Record<string, string>>({});

  // Chips visibles
  chips = signal<Chip[]>([]);

  // Señal reactiva de los query params (en vez de snapshot)
  private qp = toSignal(this.route.queryParamMap, {
    initialValue: this.router.parseUrl(this.router.url).queryParamMap
  });

  constructor() {
    // Este effect se ejecuta SIEMPRE que cambian los query params
    effect(() => {
      const qpm = this.qp();

      // Copia TODOS los query params actuales a objeto plano
      const filters: Record<string, string> = {};
      qpm.keys.forEach(k => {
        const v = qpm.get(k);
        if (v !== null && v !== '') filters[k] = v;
      });

      this.currentFilters.set(filters);

      // Página (por defecto 1)
      this.page.set(Number(qpm.get('page') ?? 1));

      // Recalcula chips
      this.chips.set(this.buildChips(filters));

      // Carga resultados
      this.load();
    });
  }

  // ------------------------
  // Carga de resultados (API)
  // ------------------------
  async load() {
    this.loading.set(true);
    try {
      const res = await firstValueFrom(
        this.api.searchEvents({
          ...this.currentFilters(),
          page: String(this.page()),
          per_page: String(this.perPage())
        })
      );
      const page: PageResponse<EventDTO> = res;

      // Convertir y ordenar: primero eventos con fecha, por fecha asc; luego los sin fecha por id desc
      const vms = page.data.map(adaptEvent);
      vms.sort((a, b) => {
        const aStart = a.when?.start;
        const bStart = b.when?.start;

        if (aStart && bStart) {
          return aStart.getTime() - bStart.getTime();
        }
        if (aStart && !bStart) return -1; // a antes que b
        if (!aStart && bStart) return 1;  // b antes que a

        // Ambos sin fecha: fallback por id descendente
        return Number(b.id) - Number(a.id);
      });

      //this.items.set(page.data.map(adaptEvent));
      this.items.set(vms);
      this.total.set(page.total);
      if (page.perPage) this.perPage.set(page.perPage);
    } finally {
      this.loading.set(false);
    }
  }

  // ------------------------
  // Chips (crear y quitar)
  // ------------------------
  private buildChips(f: Record<string, string>): Chip[] {
    const out: Chip[] = [];

    if (f['q']) out.push({ key: 'q', value: f['q'], text: `Texto: "${f['q']}"` });

    // --- Fecha (rango o simple) ---
    const df = f['from'] || f['date_from']; // compat
    const dt = f['to']   || f['date_to'];   // compat
    if (df || dt) {
      out.push({ key: 'date_range', text: `Fecha: ${this.prettyDateRange(df, dt)}` });
    } else if (f['date']) {
      out.push({ key: 'date', value: f['date'], text: `Fecha: ${this.prettyDate(f['date'])}` });
    }
    if (f['municipality']) {
      out.push({ key: 'municipality', value: f['municipality'], text: `Municipio: ${f['municipality']}` });
    }

    if (f['type_slug']) {
      out.push({ key: 'type_slug', value: f['type_slug'], text: `Tipo: ${this.prettyType(f['type_slug'])}` });
    }

    if (f['accessibility_tags']) out.push({ key: 'accessibility_tags', value: f['accessibility_tags'], text: 'Accesible' });

    if (f['is_indoor'] === '1') out.push({ key: 'is_indoor', text: 'Indoor' });

    // Edad: combinamos age_min / age_max en un único chip
    const min = f['age_min'] ? Number(f['age_min']) : undefined;
    const max = f['age_max'] ? Number(f['age_max']) : undefined;
    if (min !== undefined || max !== undefined) {
      let label = 'Edad: ';
      if (min !== undefined && max !== undefined) label += `${min}–${max}`;
      else if (min !== undefined) label += `≥${min}`;
      else if (max !== undefined) label += `≤${max}`;
      out.push({ key: 'age_range', text: label });
    }

    return out;
  }

  chipTrackBy = (_: number, c: Chip) => `${c.key}:${c.value ?? ''}`;

  removeChip(c: Chip) {
    // Partimos de los filtros actuales
    const next: Record<string, string> = { ...this.currentFilters() };

    switch (c.key) {
      case 'q':
        delete next['q'];
        break;
      case 'date':
        delete next['date'];
        break;
      case 'date_range':
        delete next['from'];
        delete next['to'];
        // compat:
        delete next['date_from'];
        delete next['date_to'];
        break;
      case 'municipality':
      case 'type_slug':
      case 'accessibility_tags':
      case 'is_indoor':
        delete next[c.key];
        break;

      case 'age_range':
        delete next['age_min'];
        delete next['age_max'];
        break;
    }

    // Reset a la primera página
    next['page'] = '1';
    // Mantén el per_page actual (útil si lo cambiaste)
    next['per_page'] = String(this.perPage());

    // Reemplaza completamente los params (sin merge) y
    //    NO llamamos a this.load(): el effect reaccionará a qp
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: next,
      queryParamsHandling: '' // reemplaza (así desaparece el chip)
    });
  }

  // ------------------------
  // Paginación
  // ------------------------
  pageChange(e: PageEvent) {
    // Construye la nueva query a partir de los filtros actuales
    const next: Record<string, string> = { ...this.currentFilters() };

    if (e.pageSize !== this.perPage()) {
      this.perPage.set(e.pageSize);
      next['page'] = '1';
      next['per_page'] = String(e.pageSize);
    } else {
      this.page.set(e.pageIndex + 1);
      next['page'] = String(this.page());
      next['per_page'] = String(this.perPage());
    }

    // Podemos usar merge aquí porque solo tocamos page/per_page
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: next,
      queryParamsHandling: 'merge'
    });
    // No llamamos a load(): el effect lo hará al cambiar qp
  }

  // ------------------------
  // Helpers de presentación
  // ------------------------
  private prettyDate(iso: string) {
    const [y, m, d] = iso.split('-').map(Number);
    const dt = new Date(y, (m - 1), d);
    return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' })
      .format(dt)
      .replace('.', '');
  }

  private prettyType(slug: string) {
    return slug.replace(/-/g, ' ').replace(/\b\w/g, m => m.toUpperCase());
  }

private prettyDateRange(df?: string, dt?: string) {
  const fromTxt = df ? this.prettyDate(df) : '…';
  const toTxt   = dt ? this.prettyDate(dt) : '…';
  if (df && dt && df === dt) return fromTxt; // mismo día
  return `${fromTxt} – ${toTxt}`;
}

// Devuelve solo filtros "de búsqueda", sin paginación
private getFilterQueryParams(): Record<string, string> {
  const qs: Record<string, string> = { ...this.currentFilters() };
  delete qs['page'];
  delete qs['per_page'];
  return qs;
}

// Para habilitar/deshabilitar el botón si no hay filtros
hasActiveFilters(): boolean {
  const qs = this.getFilterQueryParams();
  return Object.keys(qs).length > 0;
}

// Abre la página de búsqueda con los filtros aplicados (si existen)
openFilters(): void {
  const qs = this.getFilterQueryParams();
  this.router.navigate(
    ['/buscar'], // ← ajusta a tu ruta si usas /buscar u otra
    { queryParams: Object.keys(qs).length ? qs : undefined }
  );
}

  
}
