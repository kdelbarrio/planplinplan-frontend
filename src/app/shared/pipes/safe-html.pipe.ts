import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({ name: 'safeHtml', pure: true })
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value?: string): SafeHtml | null {
    if (!value) return null;

    // Crea un contenedor temporal
    const wrapper = document.createElement('div');
    wrapper.innerHTML = value;

    // Elimina todos los iframes del HTML
    wrapper.querySelectorAll('iframe').forEach((iframe) => {
      iframe.remove();
    });

    // Obtiene el HTML limpio sin iframes
    const cleanHtml = wrapper.innerHTML;

    // Devuelve el HTML sanitizado
    return this.sanitizer.bypassSecurityTrustHtml(cleanHtml);
  }
}
