import { Component, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { firstValueFrom, Observable } from 'rxjs';

import { DateRangeDialogComponent, DateRangeResult } from '../../shared/ui/date-range/date-range-dialog.component';
import { LastPlan, IndoorEventsService } from '../../core/services/indoor-events.services';

export type PlanCard = LastPlan;

@Component({
  selector: 'app-home',
standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DatePipe,
    // Material
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage {
  private router = inject(Router);
  private dialog = inject(MatDialog);
  //private plansService = inject(LastPlansService);
  private indoorSvc = inject(IndoorEventsService);
  
  // Observable con los 5 eventos indoor más próximos a hoy
  latestIndoor$: Observable<PlanCard[]> = this.indoorSvc.getNearestIndoorEvents(5);

  @ViewChild('carousel', { static: false }) carousel?: ElementRef<HTMLElement>;

  // Tipos de planes (ajusta ids/labels a tu backend)
  planTypes = [
    //{ id: 'actividad-infantil', label: 'Actividad Infantil', icon: 'child_care' },
    { id: 'bertsolarismo', label: 'Bertsolarismo', icon: 'mic' },
    { id: 'cine-y-audiovisuales', label: 'Cine y audiovisuales', icon: 'movie' },
    { id: 'concierto', label: 'Concierto', icon: 'music_note' },
    //{ id: 'concurso', label: 'Concurso', icon: 'emoji_events' },
    //{ id: 'conferencia', label: 'Conferencia', icon: 'record_voice_over' },
    { id: 'danza', label: 'Danza', icon: 'sports_gymnastics' },
    //{ id: 'eventosjornadas', label: 'Eventos/Jornadas', icon: 'event' },
    { id: 'exposicion', label: 'Exposición', icon: 'photo_library' },
    { id: 'experiencias-top', label: 'Experiencias Top', icon: 'auto_awesome' },
    { id: 'festival', label: 'Festival', icon: 'festival' },
    { id: 'feria', label: 'Feria', icon: 'storefront' },
    { id: 'fiestas', label: 'Fiestas', icon: 'celebration' },
    //{ id: 'formacion', label: 'Formación', icon: 'school' },
    { id: 'rutas', label: 'Ruta', icon: 'hiking' },
    { id: 'taller', label: 'Taller', icon: 'build' },
    { id: 'teatro', label: 'Teatro', icon: 'theaters' },
  ];

  latest: PlanCard[] = [];
/*
  ngOnInit() {
    // Carga los 3 últimos planes
    this.plansService.getLatest(5).subscribe({
      next: (res) => (this.latest = res),
      error: () => {
        // Fallback de ejemplo si el API falla
        this.latest = [
          { id: 1, title: 'Cuentacuentos: "Gau beltza"', city: 'Azpeitia', date: '2025-11-27', image: null },
          { id: 2, title: 'Concierto familiar', city: 'Bilbao', date: '2025-11-28', image: null },
          { id: 3, title: 'Taller en el museo', city: 'Vitoria-Gasteiz', date: '2025-11-29', image: null },
        ];
      }
    });
  }*/

  // Navegaciones rápidas por fecha
  goToday() {
    const today = this.formatDate(new Date());
    this.router.navigate(['/planes'], { queryParams: { date_from: today, date_to: today } });
  }

  goTomorrow() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const t = this.formatDate(d);
    this.router.navigate(['/planes'], { queryParams: { date_from: t, date_to: t } });
  }

  goNextWeekend() {
    const { start, end } = this.nextWeekend();
    this.router.navigate(['/planes'], {
      queryParams: { date_from: this.formatDate(start), date_to: this.formatDate(end) }
    });
  }

  async openDateDialog() {
    const ref = this.dialog.open<DateRangeDialogComponent, void, DateRangeResult>(DateRangeDialogComponent, {
      width: '360px'
    });
    const result = await ref.afterClosed().toPromise();
    if (result?.from && result?.to) {
      this.router.navigate(['/planes'], {
        queryParams: { date_from: this.formatDate(result.from), date_to: this.formatDate(result.to) }
      });
    }
  }

  // Tipos 
  goType(typeId: string) {
    this.router.navigate(['/planes'], { queryParams: { type_slug: typeId } });
  }

  // Carrusel
  scroll(direction: 'prev' | 'next') {
    const el = this.carousel?.nativeElement;
    if (!el) return;
    const cardWidth = el.querySelector('.plan-card')?.clientWidth ?? 280;
    const gap = 16;
    const delta = (cardWidth + gap) * (direction === 'next' ? 1 : -1);
    el.scrollBy({ left: delta, behavior: 'smooth' });
  }

  // Utils
  private formatDate(d: Date) {
    // YYYY-MM-DD
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private nextWeekend(): { start: Date; end: Date } {
    const now = new Date();
    const day = now.getDay(); // 0=Dom ... 6=Sáb
    const daysUntilSaturday = (6 - day + 7) % 7 || 7; // si ya es Sábado, siguiente
    const saturday = new Date(now);
    saturday.setDate(now.getDate() + daysUntilSaturday);
    const sunday = new Date(saturday);
    sunday.setDate(saturday.getDate() + 1);
    return { start: saturday, end: sunday };
  }
}
