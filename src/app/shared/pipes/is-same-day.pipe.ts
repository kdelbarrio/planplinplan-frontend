import { Pipe, PipeTransform } from '@angular/core';

type D = Date | string | number | null | undefined;

@Pipe({ name: 'isSameDay', standalone: true })
export class IsSameDayPipe implements PipeTransform {
  transform(a: D, b: D, useUTC = false): boolean {
    if (!a || !b) return false;

    const da = this.toDate(a);
    const db = this.toDate(b);
    if (!da || !db) return false;

    return useUTC
      ? (da.getUTCFullYear() === db.getUTCFullYear()
        && da.getUTCMonth() === db.getUTCMonth()
        && da.getUTCDate() === db.getUTCDate())
      : (da.getFullYear() === db.getFullYear()
        && da.getMonth() === db.getMonth()
        && da.getDate() === db.getDate());
  }

  private toDate(v: D): Date | null {
    if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
    const d = new Date(v as any);
    return isNaN(d.getTime()) ? null : d;
  }
}
