// src/app/services/favorites.service.ts
import { Injectable } from '@angular/core';
import { FavoritesStore } from '../../data/favorites.store';
import { PlanFav, PlaceFav } from '../../data/favorites.db';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private store = new FavoritesStore();

  plans$ = this.store.plans$;
  places$ = this.store.places$;

  isPlanFav(id: string) { return this.store.isPlanFav(id); }
  addPlan(f: PlanFav) { return this.store.addPlan(f); }
  removePlan(id: string) { return this.store.removePlan(id); }

  isPlaceFav(mid: string) { return this.store.isPlaceFav(mid); }
  addPlace(p: PlaceFav) { return this.store.addPlace(p); }
  removePlace(mid: string) { return this.store.removePlace(mid); }
}
