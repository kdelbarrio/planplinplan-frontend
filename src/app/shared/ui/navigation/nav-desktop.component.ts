import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-nav-desktop',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, RouterLink, RouterLinkActive],
  template: `
    <mat-toolbar color="primary" role="navigation" aria-label="Navegación principal">
      <span><a routerLink="/home"><img width="200px" src="assets/images/logo-planplinplan.png" alt="Plan Plin Plan"></a></span>
      <span class="spacer"></span>

      <a mat-button routerLink="/buscar" routerLinkActive="active" [attr.aria-current]="rla.isActive ? 'page' : null" #rla="routerLinkActive">
        <mat-icon>search</mat-icon>
        Buscar plan
      </a>

      <a mat-button routerLink="/favoritos/lugares" routerLinkActive="active" [attr.aria-current]="rla2.isActive ? 'page' : null" #rla2="routerLinkActive">
        <mat-icon>place</mat-icon>
        Mis lugares
      </a>

      <a mat-button routerLink="/favoritos/planes" routerLinkActive="active" [attr.aria-current]="rla3.isActive ? 'page' : null" #rla3="routerLinkActive">
        <mat-icon>star</mat-icon>
        Mis planes
      </a>
    </mat-toolbar>
  `,
  styles: [`
    .spacer { flex: 1; }
    a.active { font-weight: 600; }
  `]
})
export class NavDesktopComponent {}
