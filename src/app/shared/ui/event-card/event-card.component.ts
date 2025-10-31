import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { EventVM } from '../../../core/models/event.vm';
import { DateLocalePipe } from '../../pipes/date-locale.pipe';;
import { A11yTagsPipe } from '../../pipes/a11y-tags.pipe';



@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [NgIf,MatCardModule, DateLocalePipe, A11yTagsPipe, RouterModule],
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.scss']
})
export class EventCardComponent {
  @Input() event!: EventVM;
}
