import { Component, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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

  ages = signal<AgeChip[]>([
    { label: '3-6',  min: 3,  max: 6,  selected: false },
    { label: '7-10', min: 7,  max: 10, selected: false },
    { label: '11 o más', min: 11, max: null, selected: false },
  ]);

  agesTrackBy = (_: number, a: AgeChip) => a.label;

  form = this.fb.nonNullable.group({
    q:        [''],
    date:     <Date | null>(null),
    place:    [''],
    type:     [''],
    a11yOnly: [false],
    indoor:   [false],
  });

  anyAgeSelected = computed(() => this.ages().some(a => a.selected));

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
    if (v.date) qp['date'] = v.date.toISOString().slice(0,10);
    if (v.place?.trim()) qp['place'] = v.place.trim();
    if (v.type) qp['type'] = v.type;
    if (v.a11yOnly) qp['a11y'] = '1';
    if (v.indoor) qp['indoor'] = '1';

    if (this.anyAgeSelected()) {
      const sel = this.ages().filter(a => a.selected);
      const min = Math.min(...sel.map(a => a.min));
      const maxVals = sel.map(a => a.max).filter((n): n is number => n !== null);
      const max = maxVals.length ? Math.max(...maxVals) : null;
      qp['minAge'] = String(min);
      if (max !== null) qp['maxAge'] = String(max);
    }

    this.router.navigate(['/events'], { queryParams: qp });
  }
}
