import { Component, inject, signal, computed, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';

import { NgIf, NgFor } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }    from '@angular/material/input';
import { MatIconModule }     from '@angular/material/icon';
import { MatSelectModule }   from '@angular/material/select';
import { MatButtonModule }   from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule }    from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDateRangePicker } from '@angular/material/datepicker';
import { MatCheckboxChange } from '@angular/material/checkbox';

type AgeChip = { label: string; min: number; max: number | null; selected: boolean };

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    // Angular
    ReactiveFormsModule, NgIf, NgFor, HttpClientModule,
    // Material
    MatFormFieldModule, MatInputModule, MatIconModule, MatSelectModule,
    MatButtonModule, MatCheckboxModule, MatChipsModule,
    MatDatepickerModule, MatNativeDateModule, MatAutocompleteModule, MatDateRangePicker
  ],
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss']
})
export class SearchPage {
  private fb     = inject(FormBuilder);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);
  private http   = inject(HttpClient);

  // ---- Edades (chips locales) ----
  ages = signal<AgeChip[]>([
    { label: 'De 0 a 3 años',      min: 0,  max: 3,  selected: false },
    { label: 'De 4 a 8 años',      min: 4,  max: 8,  selected: false },
    { label: 'De 9 a 12 años',     min: 9,  max: 12, selected: false },
    //{ label: '11 o más', min: 11, max: null, selected: false },
  ]);
  agesTrackBy = (_: number, a: AgeChip) => a.label;

  // ---- Form (sin <form [formGroup]>, usamos [formControl]) ----
  form = this.fb.nonNullable.group({
    q:         [''],
    date_from: <Date | null>(null),   // rango: inicio
    date_to:   <Date | null>(null),   // rango: fin
    place:     [''],                  // en URL se mapea a municipality
    type:      [''],                  // en URL se mapea a type_slug
    a11yOnly:  [false],               // URL: a11y = 1
    indoor:    [false],               // URL: is_indoor = 1
  });

  anyAgeSelected = computed(() => this.ages().some(a => a.selected));

  // ---- Autocomplete (JSON local) ----
  private allMunicipalities: string[] = [];
  municipalityOptions = signal<string[]>([]);
  suggestLoading = signal<boolean>(false);

  // Query params reactivos
  private qp = toSignal(this.route.queryParamMap, {
    initialValue: this.router.parseUrl(this.router.url).queryParamMap
  });

  constructor() {
    // 1) Cargar una vez el JSON local (cachea por navegador)
   this.http.get<{ items: { nameEs: string }[] }>('/assets/json/municipalities.json').subscribe({
    next: (payload) => {
      this.allMunicipalities = (payload?.items ?? [])
        .map(i => i.nameEs?.trim())
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
    },
    error: () => { this.allMunicipalities = []; }
  });

    // 2) Precargar desde la URL
    effect(() => {
      const qpm = this.qp();

      this.form.patchValue({
        q: qpm.get('q') ?? '',
        date_from: this.parseDateOrNull(qpm.get('from')), // backend usa 'from'
        date_to:   this.parseDateOrNull(qpm.get('to')),   // backend usa 'to'
        place: qpm.get('municipality') ?? '',
        type:  qpm.get('type_slug')    ?? '',
        a11yOnly:  qpm.get('accessibility_tags') === 'a11y',
        indoor:    qpm.get('is_indoor') === '1',
      }, { emitEvent: false });

      // Edades desde age_min/age_max
      const min = this.parseIntOrUndef(qpm.get('age_min'));
      const max = this.parseIntOrUndef(qpm.get('age_max'));
      this.ages.update(list => list.map(chip => ({
        ...chip,
        selected: this.ageChipSelectedByRange(chip, min, max)
      })));

      // Sugerencias iniciales (si ya hay texto)
      const current = this.form.controls.place.value?.trim() || '';
      this.updateSuggestions(current);
    });

    // 3) Reaccionar a lo que escribe el usuario en "place"
    this.form.controls.place.valueChanges.subscribe(v => {
      const q = (typeof v === 'string' ? v : '').trim();
      this.updateSuggestions(q);
    });
  }

  // ---------- Autocomplete (local) ----------
  private norm(s: string) {
    return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  }

  private updateSuggestions(q: string) {
    if (q.length < 2 || this.allMunicipalities.length === 0) {
      this.municipalityOptions.set([]);
      return;
    }
    this.suggestLoading.set(true);
    // Pequeño debounce manual (~1 frame)
    queueMicrotask(() => {
      const qq = this.norm(q);
      const out = this.allMunicipalities
        .filter(m => this.norm(m).includes(qq))
        .slice(0, 15);
      this.municipalityOptions.set(out);
      this.suggestLoading.set(false);
    });
  }

  onMunicipalitySelected(option: string) {
    this.form.patchValue({ place: option });
  }

  clearPlace() {
    this.form.patchValue({ place: '' });
    this.municipalityOptions.set([]);
  }

  // ---------- Edades ----------
   toggleAge(chip: AgeChip) {
    chip.selected = !chip.selected;
    this.ages.set([...this.ages()]);
  }
  

  // ---------- Submit ----------
  submit() {
    const v = this.form.getRawValue();
    const qp: Record<string, string> = {};

    if (v.q?.trim()) qp['q'] = v.q.trim();

    // Rango de fechas → backend: from / to
    const df = this.formatDate(v.date_from ?? null);
    const dt = this.formatDate(v.date_to ?? null);
    if (df) qp['from'] = df;
    if (dt) qp['to']   = dt;

    if (v.place?.trim()) qp['municipality'] = v.place.trim();
    if (v.type)          qp['type_slug']    = v.type;
    if (v.a11yOnly)      qp['accessibility_tags'] = 'a11y';
    if (v.indoor)        qp['is_indoor']    = '1';

    // Edad → rango min/max
    if (this.anyAgeSelected()) {
      const sel = this.ages().filter(a => a.selected);
      const min = Math.min(...sel.map(a => a.min));
      const finiteMax = sel.map(a => a.max).filter((n): n is number => Number.isFinite(n as number));
      const max = finiteMax.length ? Math.max(...finiteMax) : null;
      qp['age_min'] = String(min);
      if (max !== null) qp['age_max'] = String(max);
    }

    this.router.navigate(['/planes'], { queryParams: qp });
  }

  // ---------- Helpers ----------
  private parseDateOrNull(s: string | null): Date | null {
    if (!s) return null;
    const [y, m, d] = s.split('-').map(Number);
    if (!y || !m || !d) return null;
    const dt = new Date(y, m - 1, d);
    return isNaN(dt.getTime()) ? null : dt;
  }

  private formatDate(d: Date | null): string | undefined {
    if (!d) return undefined;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private parseIntOrUndef(s: string | null): number | undefined {
    if (!s) return undefined;
    const n = Number(s);
    return Number.isFinite(n) ? n : undefined;
  }

  private ageChipSelectedByRange(chip: AgeChip, min?: number, max?: number): boolean {
    if (min === undefined && max === undefined) return false;
    const lo = min ?? -Infinity;
    const hi = max ?? Infinity;
    const chipLo = chip.min;
    const chipHi = chip.max ?? Infinity;
    return chipLo <= hi && chipHi >= lo;
  }

openDatepicker(picker: MatDateRangePicker<Date>) {
  // Evita abrirlo repetidamente o si ya está abierto
  if (picker && !picker.opened) {
    picker.open();
  }
}
}
