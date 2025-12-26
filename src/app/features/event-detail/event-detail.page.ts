import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { adaptEvent } from '../../core/adapters/event.adapter';
import { DateLocalePipe } from '../../shared/pipes/date-locale.pipe';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { SafeHtmlPipe } from '../../shared/pipes/safe-html.pipe';
import { FavoritesService } from '../../core/services/favorites.service';
import { MatTooltipModule } from '@angular/material/tooltip';


import { EuskalmetWidgetComponent } from '../../shared/ui/euskalmet-widget/euskalmet-widget.component';



@Component({
  standalone: true,
  templateUrl: './event-detail.page.html',
  styleUrls: ['./event-detail.page.scss'],
  imports: [
    NgIf,
    DateLocalePipe,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatCardModule,
    MatChipsModule,
    SafeHtmlPipe,
    MatTooltipModule,
    EuskalmetWidgetComponent,
  ]
})
export class EventDetailPage {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private favs = inject(FavoritesService);
  private router = inject(Router);


  event: ReturnType<typeof adaptEvent> | undefined;
  isFav = false;


  /** Filtros que pudieran llegar desde la página Planes */
  private backFilters: Record<string, any> | undefined;
  /** Origen de la navegación (solo nos importa 'planes') */
  private fromPage: 'planes' | string | undefined;

  ngOnInit() {

    // Recuperamos el estado de navegación (filtros y from)
    const nav = this.router.getCurrentNavigation();
    const state = (nav?.extras?.state ?? {}) as any;

    this.backFilters = state?.filters;
    this.fromPage = state?.from; 

    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getEvent(id).subscribe(async dto => {
      // 1) Adaptamos el DTO al modelo de evento
      this.event = adaptEvent(dto);

      // 2) Comprobamos si ya está en favoritos
      if (this.event?.id != null) {
        this.isFav = await this.favs.isPlanFav(String(this.event.id));
      }

    });
  }

  /** Alterna el estado de favorito para el plan actual */
  async toggleFav() {
    if (!this.event?.id) return;

    const id = String(this.event.id);

    if (this.isFav) {
      await this.favs.removePlan(id);
      this.isFav = false;
      return;
    }

    // Meta opcional: intenta coger título/imagen/municipio si existen
    const title =
      (this.event as any)?.title ??
      (this.event as any)?.name ??
      (this.event as any)?.titleEs ??
      'Plan';

    const image =
      (this.event as any)?.imageUrl ??
      (this.event as any)?.cover ??
      (this.event as any)?.picture ??
      undefined;

    const start =
      (this.event as any)?.when?.start ??
      undefined;
    
    const end =
      (this.event as any)?.when?.end ??
      undefined;

    const municipalityId =
      (this.event as any)?.location?.municipalityId ??
      (this.event as any)?.municipalityId ??
      undefined;  

    const municipality =
      (this.event as any)?.location?.municipality ??
      (this.event as any)?.municipality ??
      undefined;

    await this.favs.addPlan({
      id,
      title,
      image,
      //municipalityId,
      municipality,
      start,
      end,
      // si FavoritesService añade addedAt internamente, se puede omitir
      addedAt: Date.now()
    });

    this.isFav = true;
  }

  /** Enlace “Planes”: solo mantiene filtros si viene de la página Planes */
  goBackToPlans() {
    if (this.fromPage === 'planes' && this.backFilters && Object.keys(this.backFilters).length) {
      this.router.navigate(['/planes'], { queryParams: this.backFilters });
      return;
    }

    // resto de casos: ir a /planes sin filtros
    this.router.navigate(['/planes']);
  }


}
