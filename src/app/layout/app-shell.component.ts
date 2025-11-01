import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavDesktopComponent } from '../shared/ui/navigation/nav-desktop.component';
import { NavMobileComponent } from '../shared/ui/navigation/nav-mobile.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, NavDesktopComponent, NavMobileComponent],
  template: `
    <!-- Nav desktop -->
    <app-nav-desktop class="hide-sm"></app-nav-desktop>
    <!-- Nav móvil -->
    <app-nav-mobile class="show-sm"></app-nav-mobile>
    <!-- Contenido -->
    <main class="app-content">
      <router-outlet></router-outlet>
    </main>


  `,
  styles: [`
    :host { display: contents; }
    .app-content { padding: 16px; }
    /* Breakpoints mobile-first */
    .hide-sm { display: none; }
    .show-sm { display: block; }
    @media (min-width: 768px) {
      .hide-sm { display: block; }
      .show-sm { display: none; }
      .app-content { padding: 24px; }
    }
  `]
})
export class AppShellComponent {}
