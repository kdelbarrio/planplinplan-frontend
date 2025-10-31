import { Component, inject } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { EventsService } from './events.service';
import { SearchComponent } from '../search/search.component';
import { EventCardComponent } from '../../shared/ui/event-card/event-card.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  standalone: true,
  selector: 'app-events-page',
  imports: [NgIf, NgFor, SearchComponent, EventCardComponent, MatProgressBarModule, MatPaginatorModule],
  templateUrl: './events.page.html'
})
export class EventsPage {
  svc = inject(EventsService);

  onPage(e: PageEvent) {
    this.svc.goToPage(e.pageIndex + 1);
  }
}
