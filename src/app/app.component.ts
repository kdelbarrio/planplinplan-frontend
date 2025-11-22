import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatToolbarModule, MatButtonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Plan Plin Plan';

  async ngOnInit() {
    // Solicita permiso al navegador para hacer el almacenamiento persistente
    if ('storage' in navigator && 'persist' in navigator.storage) {
      const persisted = await navigator.storage.persisted();
      if (!persisted) {
        try {
          await navigator.storage.persist();
          console.log('✅ Almacenamiento persistente habilitado');
        } catch {
          console.warn('⚠️ No se pudo habilitar almacenamiento persistente');
        }
      } else {
        console.log('ℹ️ El almacenamiento ya era persistente');
      }
    }
  }
}

