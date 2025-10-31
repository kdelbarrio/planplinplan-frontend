import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { EventsService } from '../events/events.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, MatButtonModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {
  private fb = inject(FormBuilder);
  private events = inject(EventsService);

  readonly form = this.fb.group({
    q: [''],
    from: [''],
    to: [''],
    territory: [''],
    municipality: [''],
    minAge: [null],
    maxAge: [null]
  });

submit() {
  const raw = this.form.value;
  // Convierte '' y null a undefined para encajar en EventFilters
  const cleaned = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, v === '' || v === null ? undefined : v])
  );
  this.events.setFilters(cleaned);
}

}
