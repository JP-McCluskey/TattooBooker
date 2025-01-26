export type TattooStyle =
  | 'Tebori'
  | 'Botanical'
  | 'Portraiture'
  | 'Sketch'
  | 'Maori'
  | 'Colored Realism'
  | 'Calligraphy'
  | 'Black & Grey'
  | 'Micro Realism'
  | 'Minimal'
  | 'Fineline'
  | 'Illustrative'
  | 'Realism'
  | 'Abstract'
  | 'Asian'
  | 'Geometric'
  | 'Blackwork'
  | 'Dotwork'
  | 'Lettering';

export interface TattooImage {
  id: string;
  user_id?: string;
  artist_id?: string;
  business_id?: number;
  placement: string;
  styles: TattooStyle[];
  likes_count: number;
  favorites_count: number;
  image_url: string;
  bucket_url?: string;
  created_at: string;
  updated_at: string;
}