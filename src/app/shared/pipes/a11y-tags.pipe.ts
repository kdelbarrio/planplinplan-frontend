import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'a11yTags', standalone: true })
export class A11yTagsPipe implements PipeTransform {
  transform(tags: string[] = []): string {
    return tags.join(' • ');
  }
}
