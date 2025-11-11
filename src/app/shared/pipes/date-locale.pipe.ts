import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'dateLocale', standalone: true })
export class DateLocalePipe implements PipeTransform {
  transform(
    value: Date | string | undefined,
    locale = 'es-ES'
  ): string {
    if (!value) return '';

    try {
      const d = typeof value === 'string' ? new Date(value) : value;
      if (isNaN(d.getTime())) {
        console.warn('Invalid date value:', value);
        return '';
      }

      const now = new Date();
      const isSameYear = d.getFullYear() === now.getFullYear();

      // Día + mes siempre
      const baseFormatter = new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'short',
      });

      let formatted = baseFormatter.format(d).replace('.', '');

      // Si el año es distinto, lo añadimos
      if (!isSameYear) {
        formatted += ` ${d.getFullYear()}`;
      }

      return formatted;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }
}
