import Dexie, { Table } from 'dexie';

export interface PlanFav {
  id: string;             // id del plan/evento (string)
  addedAt: number;
  title?: string;
  image?: string;
  municipalityId?: string;
  municipality?: string;
}

export interface PlaceFav {
  municipalityId: string; // del JSON de municipios
  municipality: string;
  provinceId?: string;
  addedAt: number;
}

export class PPPFavoritesDB extends Dexie {
  plan_favs!: Table<PlanFav, string>;
  place_favs!: Table<PlaceFav, string>; // PK será municipalityId

  constructor() {
    super('ppp-favorites');
    this.version(1).stores({
      plan_favs: '&id,addedAt,municipalityId',     // & = PK
      place_favs: '&municipalityId,addedAt'
    });
  }
}

export const favDB = new PPPFavoritesDB();
