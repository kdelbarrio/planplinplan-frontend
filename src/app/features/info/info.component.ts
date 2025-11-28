import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-info',
  standalone: true,
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss'],
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    RouterLink,
    NgFor
  ]
})
export class InfoComponent {
  apis = [
    {
      name: 'Kulturklik',
      description: 'Agenda cultural oficial de Euskadi (eventos culturales y artísticos).',
      url: 'https://www.kulturklik.euskadi.eus'
    },
    {
      name: 'Euskadi Turismo – Experiencias',
      description: 'Actividades y experiencias turísticas en familia en Euskadi.',
      url: 'https://opendata.euskadi.eus'
    },
    {
      name: 'Euskadi Turismo – Rutas y paseos',
      description: 'Rutas y paseos recomendados para realizar en familia.',
      url: 'https://opendata.euskadi.eus'
    }
  ];
}
