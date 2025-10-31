import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'dateLocale', standalone: true })
export class DateLocalePipe implements PipeTransform {
  transform(value: Date | string | undefined, locale = 'es-ES', options: Intl.DateTimeFormatOptions = {}): string {
    if (!value) return '';
    
    try {
      const d = typeof value === 'string' ? new Date(value) : value;
      if (isNaN(d.getTime())) {
        console.warn('Invalid date value:', value);
        return '';
      }
      return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short', ...options }).format(d);
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }
}
