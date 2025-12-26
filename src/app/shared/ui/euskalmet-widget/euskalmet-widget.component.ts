import { CommonModule } from '@angular/common';
import { Component, Input, computed, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap, map, of } from 'rxjs';

import { EuskalmetLocationService } from '../../services/euskalmet-location.service';
import { environment } from '../../../../environments/environment';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-euskalmet-widget',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './euskalmet-widget.component.html',
  styleUrls: ['./euskalmet-widget.component.scss'],
})
export class EuskalmetWidgetComponent {
  // Guardamos el input en un signal (para poder componerlo reactivamente)
  private municipalitySig = signal<string | null>(null);

  @Input() set municipality(value: string | null | undefined) {
    this.municipalitySig.set(value ?? null);
  }
  @Input() showIndoorFilter = false;

  get municipality(): string | null {
    return this.municipalitySig();
  }

  enabled = environment.features.weatherWidget;

  // id desde el JSON (reactivo)
  private euskalmetId = toSignal(
    toObservable(this.municipalitySig).pipe(
      switchMap((m) => {
        if (!this.enabled || !m) return of(null);
        return this.euskalmet.getLocationIdByMunicipality(m);
      })
    ),
    { initialValue: null as string | null }
  );

  widgetUrl = computed(() => {
    const id = this.euskalmetId();
    if (!this.enabled || !id) return null;
    return `https://www.euskalmet.euskadi.eus/vamet/city_search/es/webmet00-${id}.html`;
  });

  safeUrl = computed<SafeResourceUrl | null>(() => {
    const url = this.widgetUrl();
    if (!url) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  constructor(
    private euskalmet: EuskalmetLocationService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  goToIndoorPlans(): void {
  this.router.navigate([], {
    relativeTo: this.route,
    queryParams: { is_indoor: 1 },
    queryParamsHandling: 'merge',
  });
}
}
