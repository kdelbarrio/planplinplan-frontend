export interface EventDTO {
  id: number;
  title: string;
  description?: string;
  starts_at: string;
  ends_at?: string;
  price?: number | null;
  accessibility?: string[];
  is_indoor?: boolean;
  municipality?: string;
  territory?: string;
  event_type_id?: number;
  age_min?: number | null;
  age_max?: number | null;
  image_url?: string | null;
}
