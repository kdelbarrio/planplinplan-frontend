export interface EventVM {
  id: number;
  title: string;
  description: string;
  when: { start: Date | undefined; end?: Date | undefined };
  priceLabel: string;
  tags: string[];
  municipality?: string;
  place: string;
  imageUrl?: string;
  accessibility?: string[];
  age_min?: number | null;
  age_max?: number | null;
  source_url?: string;
}
