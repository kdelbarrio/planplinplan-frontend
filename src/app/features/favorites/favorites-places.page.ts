import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }    from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatListModule }     from '@angular/material/list';
import { MatIconModule }     from '@angular/material/icon';
import { MatButtonModule }   from '@angular/material/button';
import { MatTooltipModule }  from '@angular/material/tooltip';
import { MatCardModule }    from '@angular/material/card';

import { FavoritesService } from '../../core/services/favorites.service';
import type { PlaceFav } from '../../data/favorites.db';

type Municipality = {
  municipalityId: string;
  provinceId: string;
  nameEs: string;
  nameEu: string;
};

@Component({
  selector: 'app-favorites-places',
  standalone: true,
  templateUrl: './favorites-places.page.html',
  styleUrls: ['./favorites-plans.page.scss'],
  imports: [
    // Angular
    CommonModule, ReactiveFormsModule, HttpClientModule, NgIf, NgFor,
    // Material
    MatFormFieldModule, MatInputModule, MatAutocompleteModule,
    MatListModule, MatIconModule, MatButtonModule, MatTooltipModule, MatCardModule
  ]
})
export class FavoritesPlacesPage implements OnInit {
  private fb    = inject(FormBuilder);
  private http  = inject(HttpClient);
  private router = inject(Router);
  private favs  = inject(FavoritesService);

  // === Favoritos (igual que en otras páginas) ===
  places$ = this.favs.places$ as unknown as import('rxjs').Observable<PlaceFav[]>; // tip explícito si usas strictTemplates

  // === Form (igual patrón que SearchPage) ===
  form = this.fb.nonNullable.group({
    place: [''] // texto libre
  });

  // === Sugerencias (igual patrón que SearchPage: strings) ===
  private allMunicipalities: string[] = [];     // solo nombres ES para suggest
  private byName: Map<string, Municipality> = new Map(); // para resolver ID al añadir
  municipalityOptions = signal<string[]>([]);
  suggestLoading = signal<boolean>(false);

  ngOnInit() {
    // 1) Cargar JSON local (ruta absoluta para no pasar por interceptor)
    this.http.get<{ items: Municipality[] } | Municipality[]>('/assets/json/municipalities.json')
      .subscribe({
        next: (payload: any) => {
          const items: Municipality[] = Array.isArray(payload) ? payload : (payload?.items ?? []);
          this.byName = new Map(items.map(m => [m.nameEs.trim(), m]));
          this.allMunicipalities = items
            .map(i => i.nameEs?.trim())
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
          // precalcula sugerencias si hay valor inicial
          const current = this.form.controls.place.value?.trim() || '';
          this.updateSuggestions(current);
        },
        error: (err) => {
          console.error('Error cargando municipalities.json', err);
          this.allMunicipalities = [];
          this.byName.clear();
          this.municipalityOptions.set([]);
        }
      });

    // 2) Reaccionar a cambios en el campo place (igual que SearchPage)
    this.form.controls.place.valueChanges.subscribe(v => {
      const q = (typeof v === 'string' ? v : '').trim();
      this.updateSuggestions(q);
    });
  }

  // === SUGGEST (idéntico enfoque: normalización y filtro sobre strings) ===
  private norm(s: string) {
    return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  }

  private updateSuggestions(q: string) {
    if (q.length < 2 || this.allMunicipalities.length === 0) {
      this.municipalityOptions.set([]);
      return;
    }
    this.suggestLoading.set(true);
    queueMicrotask(() => {
      const qq = this.norm(q);
      const out = this.allMunicipalities
        .filter(name => this.norm(name).includes(qq))
        .slice(0, 15);
      this.municipalityOptions.set(out);
      this.suggestLoading.set(false);
    });
  }

  // === Selección desde el autocomplete: recibimos un string (nombre) como en SearchPage ===
  async onMunicipalitySelected(name: string) {
    const m = this.byName.get(name);
    if (!m) return;

    await this.favs.addPlace({
      municipalityId: m.municipalityId,
      municipality: m.nameEs,
      provinceId: m.provinceId,
      addedAt: Date.now()
    });

    // limpiar campo + sugerencias
    this.form.patchValue({ place: '' });
    this.municipalityOptions.set([]);
  }

  clearPlace() {
    this.form.patchValue({ place: '' });
    this.municipalityOptions.set([]);
  }

  // === Acciones por lugar guardado ===
  async remove(mid: string) {
    await this.favs.removePlace(mid);
  }

  searchPlans(l: { municipalityId: string; municipality: string }) {
    // igual que en SearchPage usamos el nombre en la query (y si quieres, también pasar el id)
    this.router.navigate(['/planes'], {
      queryParams: { municipality: l.municipality, municipalityId: l.municipalityId }
    });
  }
}
