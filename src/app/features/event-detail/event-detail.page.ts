import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { adaptEvent } from '../../core/adapters/event.adapter';
import { DateLocalePipe } from '../../shared/pipes/date-locale.pipe';
import { NgIf } from '@angular/common';

@Component({
  standalone: true,
  templateUrl: './event-detail.page.html',
  imports: [NgIf, DateLocalePipe]
})
export class EventDetailPage {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);

  event: ReturnType<typeof adaptEvent> | undefined;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getEvent(id).subscribe(dto => this.event = adaptEvent(dto));
  }
}
