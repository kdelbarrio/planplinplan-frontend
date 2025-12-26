import { Injectable } from '@angular/core';
import { map, shareReplay } from 'rxjs/operators';
import { Observable, from } from 'rxjs';

type EuskalmetLocation = {
  id: string;
  displayName: string;
  geoName?: string;
};

@Injectable({ providedIn: 'root' })
export class EuskalmetLocationService {
  private locations$: Observable<EuskalmetLocation[]>;

  constructor() {
    this.locations$ = from(
      fetch('/assets/json/webmet00-locations.json').then((r) => {
        if (!r.ok) throw new Error(`Failed to load locations JSON: ${r.status}`);
        return r.json() as Promise<EuskalmetLocation[]>;
      })
    ).pipe(shareReplay(1));
  }

  getLocationIdByMunicipality(municipality: string): Observable<string | null> {
    const target = this.normalize(municipality);

    return this.locations$.pipe(
      map((list) => {
        const match = list.find(
          (x) => this.normalize(x.displayName) === target
        );
        return match?.id ?? null;
      })
    );
  }

  private normalize(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      //.replace(/[\/-]/g, ' ')
      //.replace(/\s+/g, ' ')
      .trim();
  }
}

