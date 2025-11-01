import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-nav-mobile',
  standalone: true,
  imports: [MatIconModule, RouterLink, RouterLinkActive, MatToolbarModule],
  template: `
    <mat-toolbar color="primary">
      <span><img src="assets/images/logo.svg" alt="Plan Plin Plan"></span>
    </mat-toolbar>
    <nav class="bottom-nav" role="navigation" aria-label="Navegación inferior">
      <a class="item" routerLink="/buscar" routerLinkActive="active" [attr.aria-current]="rla.isActive ? 'page' : null" #rla="routerLinkActive">
        <span class="icon-wrap"><mat-icon>search</mat-icon></span>
        <span class="label">Buscar plan</span>
      </a>

      <a class="item" routerLink="/places" routerLinkActive="active" [attr.aria-current]="rla2.isActive ? 'page' : null" #rla2="routerLinkActive">
        <span class="icon-wrap"><mat-icon>place</mat-icon></span>
        <span class="label">Mis lugares</span>
      </a>

      <a class="item" routerLink="/plans" routerLinkActive="active" [attr.aria-current]="rla3.isActive ? 'page' : null" #rla3="routerLinkActive">
        <span class="icon-wrap"><mat-icon>star</mat-icon></span>
        <span class="label">Mis planes</span>
      </a>
    </nav>
  `,
  styles: [`
    .bottom-nav {
      position: fixed;
      left: 0; right: 0; bottom: 0;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 4px;
      padding: 10px 12px calc(10px + env(safe-area-inset-bottom));
      background: var(--mat-sys-surface);
      border-top: 1px solid var(--mat-sys-outline-variant);
      z-index: 10;
    }

    .item {
      display: grid;
      justify-items: center;
      text-decoration: none;
      color: var(--mat-sys-on-surface-variant);
      font: 500 12px/1.2 var(--mat-sys-body-small-font, Roboto, Arial, sans-serif);
      padding: 6px 8px;
      border-radius: 12px;
      outline: none;
    }

    .icon-wrap {
      display: grid;
      place-items: center;
      width: 36px;
      height: 36px;
      border-radius: 18px;
      background: transparent;
      transition: background .15s ease;
      margin-bottom: 4px;
    }

    .item.active .icon-wrap {
      background: color-mix(in srgb, var(--mat-sys-primary) 18%, transparent);
    }
    .item.active {
      color: var(--mat-sys-on-surface);
    }

    /* Reserva espacio para que el contenido no quede oculto detrás del nav */
    :host-context(app-shell) + .app-content,
    :root .app-content {
      padding-bottom: 76px;
    }

    @media (min-width: 768px) {
      /* El nav móvil no se muestra en escritorio (lo controla el shell) */
      .bottom-nav { display: none; }
    }
  `]
})
export class NavMobileComponent {}
