import { EventDTO } from '../models/event.dto';
import { EventVM } from '../models/event.vm';

export function adaptEvent(dto: EventDTO): EventVM {
    const parseDate = (s?: string) => {
      if (!s) return undefined;
      const d = new Date(s);
      return isNaN(d.getTime()) ? undefined : d;
    };

    const start = parseDate(dto.starts_at);
    const end = parseDate(dto.ends_at);

    const tags: string[] = [];
    if (dto.is_indoor === true) tags.push('Indoor');
    if (dto.is_indoor === false) tags.push('Outdoor');
    if (dto.age_min != null) tags.push(`≥${dto.age_min}`);
    if (dto.age_max != null) tags.push(`≤${dto.age_max}`);
    if ((dto as any).accessibility?.length) tags.push(...(dto as any).accessibility.map((a: string) => `a11y:${a}`));

    return {
      id: dto.id,
      title: dto.title,
      description: dto.description,
      when: { start, end },
      priceLabel: (dto as any).price == null ? '(no se indica)' : `${(dto as any).price.toFixed(2)} €`,
      tags,
      municipality: dto.municipality,
      place: [ dto.municipality, dto.territory ].filter(Boolean).join(' · '),
      imageUrl: dto.image_url ?? undefined,
      source_url: dto.source_url ?? undefined,

    };
}