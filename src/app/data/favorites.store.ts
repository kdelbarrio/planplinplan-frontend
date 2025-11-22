// src/app/data/favorites.store.ts
import { liveQuery } from 'dexie';
import { BehaviorSubject } from 'rxjs';
import { favDB, PlanFav, PlaceFav } from './favorites.db';

const LS_PLANS = 'ppp.plan_favs';
const LS_PLACES = 'ppp.place_favs';

const hasIDB = typeof indexedDB !== 'undefined';

class LocalStorageMirror<T extends { [k: string]: any }> {
  constructor(private key: string) {}
  read(): T[] { try { return JSON.parse(localStorage.getItem(this.key) || '[]') } catch { return [] } }
  write(data: T[]) { localStorage.setItem(this.key, JSON.stringify(data)); }
}

export class FavoritesStore {
  private plansLS = new LocalStorageMirror<PlanFav>(LS_PLANS);
  private placesLS = new LocalStorageMirror<PlaceFav>(LS_PLACES);

  /** Streams */
  plans$ = hasIDB
    ? liveQuery(() => favDB.plan_favs.orderBy('addedAt').reverse().toArray())
    : new BehaviorSubject<PlanFav[]>(this.plansLS.read());

  places$ = hasIDB
    ? liveQuery(() => favDB.place_favs.orderBy('addedAt').reverse().toArray())
    : new BehaviorSubject<PlaceFav[]>(this.placesLS.read());

  /** PLANES */
  async isPlanFav(id: string) {
    if (hasIDB) return !!(await favDB.plan_favs.get(id));
    return this.plansLS.read().some(p => p.id === id);
  }

  async addPlan(f: PlanFav) {
    if (hasIDB) {
      await favDB.plan_favs.put({ ...f, addedAt: Date.now() });
    } else {
      const arr = this.plansLS.read();
      if (!arr.find(p => p.id === f.id)) {
        arr.unshift({ ...f, addedAt: Date.now() });
        this.plansLS.write(arr);
        (this.plans$ as BehaviorSubject<PlanFav[]>).next(arr);
      }
    }
  }

  async removePlan(id: string) {
    if (hasIDB) {
      await favDB.plan_favs.delete(id);
    } else {
      const arr = this.plansLS.read().filter(p => p.id !== id);
      this.plansLS.write(arr);
      (this.plans$ as BehaviorSubject<PlanFav[]>).next(arr);
    }
  }

  /** LUGARES */
  async isPlaceFav(municipalityId: string) {
    if (hasIDB) return !!(await favDB.place_favs.get(municipalityId));
    return this.placesLS.read().some(p => p.municipalityId === municipalityId);
  }

  async addPlace(p: PlaceFav) {
    if (hasIDB) {
      await favDB.place_favs.put({ ...p, addedAt: Date.now() });
    } else {
      const arr = this.placesLS.read();
      if (!arr.find(x => x.municipalityId === p.municipalityId)) {
        arr.unshift({ ...p, addedAt: Date.now() });
        this.placesLS.write(arr);
        (this.places$ as BehaviorSubject<PlaceFav[]>).next(arr);
      }
    }
  }

  async removePlace(municipalityId: string) {
    if (hasIDB) {
      await favDB.place_favs.delete(municipalityId);
    } else {
      const arr = this.placesLS.read().filter(p => p.municipalityId !== municipalityId);
      this.placesLS.write(arr);
      (this.places$ as BehaviorSubject<PlaceFav[]>).next(arr);
    }
  }
}
