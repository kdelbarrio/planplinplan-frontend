export interface EventVM {
  id: number;
  title: string;
  when: { start: Date; end?: Date };
  priceLabel: string;
  tags: string[];
  place: string;
  imageUrl?: string;
}
