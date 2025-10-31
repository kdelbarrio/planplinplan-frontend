import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'dateLocale', standalone: true })
export class DateLocalePipe implements PipeTransform {
  transform(value: Date | string | undefined, locale = 'es-ES', options: Intl.DateTimeFormatOptions = {}): string {
    if (!value) return '';
    const d = typeof value === 'string' ? new Date(value) : value;
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short', ...options }).format(d);
  }
}
