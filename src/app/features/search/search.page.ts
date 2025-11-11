import { Component, inject, signal, computed, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }    from '@angular/material/input';
import { MatIconModule }     from '@angular/material/icon';
import { MatSelectModule }   from '@angular/material/select';
import { MatButtonModule }   from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule }    from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { NgIf, NgFor } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';

type AgeChip = { label: string; min: number; max: number | null; selected: boolean };

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    ReactiveFormsModule, NgIf, NgFor,
    MatFormFieldModule, MatInputModule, MatIconModule, MatSelectModule,
    MatButtonModule, MatCheckboxModule, MatChipsModule,
    MatDatepickerModule, MatNativeDateModule
  ],
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss']
})
export class SearchPage {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);

  ages = signal<AgeChip[]>([
    { label: '3-6',      min: 3,  max: 6,  selected: false },
    { label: '7-10',     min: 7,  max: 10, selected: false },
    { label: '11 o más', min: 11, max: null, selected: false },
  ]);

  agesTrackBy = (_: number, a: AgeChip) => a.label;

  form = this.fb.nonNullable.group({
    q:        [''],
    date_from: <Date | null>(null),   // ← rango: inicio
    date_to:   <Date | null>(null),   // ← rango: fin
    place:    [''],                   // se mapea a municipality
    type:     [''],                   // se mapea a type_slug
    a11yOnly: [false],                // URL: a11y = 1
    indoor:   [false],                // URL: is_indoor = 1
  });

  anyAgeSelected = computed(() => this.ages().some(a => a.selected));

  // Señal reactiva de query params para precargar
  private qp = toSignal(this.route.queryParamMap, {
    initialValue: this.router.parseUrl(this.router.url).queryParamMap
  });

  constructor() {
    effect(() => {
      const qpm = this.qp();

      // Precarga campos
      this.form.patchValue({
        q: qpm.get('q') ?? '',
        date_from: this.parseDateOrNull(qpm.get('from')),
        date_to:   this.parseDateOrNull(qpm.get('to')),
        place: qpm.get('municipality') ?? '',
        type: qpm.get('type_slug') ?? '',
        a11yOnly: qpm.get('a11y') === '1',
        indoor: qpm.get('is_indoor') === '1',
      }, { emitEvent: false });

      // Edades desde age_min/age_max
      const min = this.parseIntOrUndef(qpm.get('age_min'));
      const max = this.parseIntOrUndef(qpm.get('age_max')); // puede ser undefined
      this.ages.update(list => list.map(chip => ({
        ...chip,
        selected: this.ageChipSelectedByRange(chip, min, max)
      })));
    });
  }

  clearPlace() {
    this.form.patchValue({ place: '' });
  }

  toggleAge(chip: AgeChip) {
    chip.selected = !chip.selected;
    this.ages.set([...this.ages()]);
  }

  submit() {
    const v = this.form.getRawValue();
    const qp: Record<string, string> = {};
    if (v.q?.trim()) qp['q'] = v.q.trim();

    // Rango de fechas
    const df = this.formatDate(v.date_from ?? null);
    const dt = this.formatDate(v.date_to ?? null);
    if (df) qp['from'] = df;
    if (dt) qp['to']   = dt;

    if (v.place?.trim()) qp['municipality'] = v.place.trim();
    if (v.type) qp['type_slug'] = v.type;
    if (v.a11yOnly) qp['a11y'] = '1';
    if (v.indoor) qp['is_indoor'] = '1';

    if (this.anyAgeSelected()) {
      const sel = this.ages().filter(a => a.selected);
      const min = Math.min(...sel.map(a => a.min));
      const finiteMax = sel
        .map(a => a.max)
        .filter((n): n is number => Number.isFinite(n as number));
      const max = finiteMax.length ? Math.max(...finiteMax) : null;
      qp['age_min'] = String(min);
      if (max !== null) qp['age_max'] = String(max);
    }

    // Navega al listado
    this.router.navigate(['/planes'], { queryParams: qp });
  }

  // -------- Helpers --------

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
}
