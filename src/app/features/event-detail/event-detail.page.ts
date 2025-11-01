import { Component, inject } from '@angular/core';
import { ActivatedRoute , RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { adaptEvent } from '../../core/adapters/event.adapter';
import { DateLocalePipe } from '../../shared/pipes/date-locale.pipe';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { SafeHtmlPipe } from '../../shared/pipes/safe-html.pipe';

@Component({
  standalone: true,
  templateUrl: './event-detail.page.html',
  imports: [
    NgIf,
    RouterLink, 
    DateLocalePipe,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatCardModule,
    MatChipsModule,
    SafeHtmlPipe
  ]
})
export class EventDetailPage {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);

  event: ReturnType<typeof adaptEvent> | undefined;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getEvent(id).subscribe(dto => {
      console.log('Raw DTO:', dto);
      this.event = adaptEvent(dto);
      console.log('Event when:', {
        start: this.event?.when?.start,
        end: this.event?.when?.end
      });
    });
  }
}
