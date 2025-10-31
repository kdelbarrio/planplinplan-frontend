import { Routes } from '@angular/router';
import { EventsPage } from './features/events/events.page';
import { EventDetailPage } from './features/event-detail/event-detail.page';
import { FavoritesPage } from './features/favorites/favorites.page';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: EventsPage, title: 'Eventos' },
  { path: 'event/:id', component: EventDetailPage, title: 'Detalle de evento' },
  { path: 'favorites', component: FavoritesPage, canActivate: [authGuard], title: 'Favoritos' },
  { path: '**', redirectTo: '' }
];
