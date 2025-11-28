import { Routes } from '@angular/router';
import { HomePage } from './features/home/home.page';
import { EventsPage } from './features/events/events.page';
import { EventDetailPage } from './features/event-detail/event-detail.page';
import { SearchPage } from './features/search/search.page';
import { FavoritesPlansPage } from './features/favorites/favorites-plans.page';
import { FavoritesPlacesPage } from './features/favorites/favorites-places.page';
import { authGuard } from './core/guards/auth.guard';
import { AppShellComponent } from './layout/app-shell.component';
import { InfoComponent } from './features/info/info.component';

export const routes: Routes = [
  {
    path: '',
    component: AppShellComponent,
  children: [
    { path: '', component: HomePage, title: 'Planes' },
    { path: 'planes', component: EventsPage, title: 'Planes' },
    { path: 'buscar', component: SearchPage, title: 'Buscar Planes' },
    { path: 'event/:id', component: EventDetailPage, title: 'Detalle del Plan' },
    { path: 'favoritos/planes', component: FavoritesPlansPage, title: 'Planes favoritos' },
    { path: 'favoritos/lugares', component: FavoritesPlacesPage, title: 'Lugares favoritos' },
    { path: 'info', component: InfoComponent, title: 'Información'}
  ]
  },
  { path: '**', redirectTo: '' }
];
