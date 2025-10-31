import { EventDTO } from '../models/event.dto';
import { EventVM } from '../models/event.vm';

export function adaptEvent(dto: EventDTO): EventVM {
  const start = new Date(dto.starts_at);
  const end = dto.ends_at ? new Date(dto.ends_at) : undefined;

  const tags: string[] = [];
  if (dto.is_indoor === true) tags.push('Indoor');
  if (dto.is_indoor === false) tags.push('Outdoor');
  if (dto.age_min != null) tags.push(`≥${dto.age_min}`);
  if (dto.age_max != null) tags.push(`≤${dto.age_max}`);
  if (dto.accessibility?.length) tags.push(...dto.accessibility.map(a => `a11y:${a}`));

  return {
    id: dto.id,
    title: dto.title,
    when: { start, end },
    priceLabel: dto.price == null ? 'Gratis' : `${dto.price.toFixed(2)} €`,
    tags,
    place: [dto.municipality, dto.territory].filter(Boolean).join(' · '),
    imageUrl: dto.image_url ?? undefined
  };
}
