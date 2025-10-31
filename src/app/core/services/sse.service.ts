import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SseService {
  connect(url: string): Observable<any> {
    return new Observable(sub => {
      const es = new EventSource(url);
      es.onmessage = e => sub.next(JSON.parse(e.data));
      es.onerror = err => sub.error(err);
      return () => es.close();
    });
  }
}
