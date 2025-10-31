import { Routes } from '@angular/router';
import { EventsPage } from './features/events/events.page';
import { EventDetailPage } from './features/event-detail/event-detail.page';
import { FavoritesPage } from './features/favorites/favorites.page';
import { authGuard } from './core/guards/auth.guard';
import { AppShellComponent } from './layout/app-shell.component';

export const routes: Routes = [
  {
    path: '',
    component: AppShellComponent,
  children: [
    { path: 'planes', component: EventsPage, title: 'Planes' },
    { path: 'event/:id', component: EventDetailPage, title: 'Detalle del Plan' },
    { path: 'favorites', component: FavoritesPage, canActivate: [authGuard], title: 'Favoritos' },
  ]
  },
  { path: '**', redirectTo: 'planes' }
];
