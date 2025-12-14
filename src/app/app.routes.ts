import { Routes } from '@angular/router';
import { AppShellComponent } from './layout/app-shell.component';

export const routes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      {
        path: '',
        title: 'Plan Plin Plan - Disfruta de los planes en familia',
        loadComponent: () => import('./features/home/home.page').then(m => m.HomePage),
      },
      {
        path: 'planes',
        title: 'Planes para hacer en familia',
        loadComponent: () => import('./features/events/events.page').then(m => m.EventsPage),
      },
      {
        path: 'buscar',
        title: 'Buscar Planes',
        loadComponent: () => import('./features/search/search.page').then(m => m.SearchPage),
      },
      {
        path: 'event/:id',
        title: 'Detalle del Plan',
        loadComponent: () => import('./features/event-detail/event-detail.page').then(m => m.EventDetailPage),
      },
      {
        path: 'favoritos/planes',
        title: 'Planes favoritos',
        loadComponent: () =>
          import('./features/favorites/favorites-plans.page').then(m => m.FavoritesPlansPage),
      },
      {
        path: 'favoritos/lugares',
        title: 'Lugares favoritos',
        loadComponent: () =>
          import('./features/favorites/favorites-places.page').then(m => m.FavoritesPlacesPage),
      },
      {
        path: 'info',
        title: 'Información',
        loadComponent: () => import('./features/info/info.component').then(m => m.InfoComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
