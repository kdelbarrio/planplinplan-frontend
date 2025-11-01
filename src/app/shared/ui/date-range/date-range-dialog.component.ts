import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';

export interface DateRangeResult {
  from: Date | null;
  to: Date | null;
}

@Component({
  selector: 'app-date-range-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    // Material
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
  ],
  templateUrl: './date-range-dialog.component.html'
})
export class DateRangeDialogComponent {
  private ref = inject(MatDialogRef<DateRangeDialogComponent, DateRangeResult>);
  from: Date | null = null;
  to: Date | null = null;

  close() {
    this.ref.close();
  }

  apply() {
    this.ref.close({ from: this.from, to: this.to });
  }
}
