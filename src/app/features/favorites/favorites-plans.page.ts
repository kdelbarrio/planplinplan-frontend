import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; 
import { FavoritesService } from '../../core/services/favorites.service';
import { DateLocalePipe } from '../../shared/pipes/date-locale.pipe';
import { MatIcon } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';


@Component({
  selector: 'app-favorites-plans',
  templateUrl: './favorites-plans.page.html',
  styleUrls: ['./favorites-plans.page.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, DateLocalePipe, MatIcon, MatListModule, MatButtonModule, MatMenuModule, MatCardModule],
})
export class FavoritesPlansPage {

  private favs = inject(FavoritesService);   
  plans$ = this.favs.plans$;                 

  async remove(id: string) {
    await this.favs.removePlan(id);
  }

  async share(p: any) {
    const url = this.buildPlanUrl(p.id); // construye la URL canónica del detalle
    const text = `Plan recomendado: ${p.title}`;
    const title = 'Plan Plin Plan';

    // 1) Web Share API (mejor UX en móvil)
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {}
    }

    // 2) Fallback: enlaces directos
    const wa = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
    const tw = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    // Instagram no tiene intent web oficial para compartir enlaces → mostramos diálogo simple
    const igInfo = 'Instagram no permite compartir enlaces por intent web. Copia el enlace y pégalo en tu historia/DM.';

    // Muestra un mini-diálogo o snackbar con opciones
    window.open(wa, '_blank');
    setTimeout(() => window.open(tw, '_blank'), 300);
    alert(`${igInfo}\n\n${url}`);
  }

  private buildPlanUrl(id: string) {
    // ajusta a routing real (SSR/SPA)
    return `${location.origin}/plan/${encodeURIComponent(id)}`;
  }
}
