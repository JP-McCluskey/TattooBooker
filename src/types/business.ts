export interface OpeningHours {
  monday?: { open: string; close: string };
  tuesday?: { open: string; close: string };
  wednesday?: { open: string; close: string };
  thursday?: { open: string; close: string };
  friday?: { open: string; close: string };
  saturday?: { open: string; close: string };
  sunday?: { open: string; close: string };
}

export interface Business {
  id: number;
  place_id?: string;
  title: string;
  description?: string | null;
  address?: string | null;
  neighborhood?: string | null;
  street?: string | null;
  city?: string | null;
  postal_code?: string | null;
  state?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  country_code?: string | null;
  phone_unformatted?: string | null;
  website?: string | null;
  total_score?: number | null;
  reviews_count?: number | null;
  images_count?: number | null;
  permanently_closed?: boolean | null;
  temporarily_closed?: boolean | null;
  wheelchair_accessible?: boolean | null;
  scraped_at?: Date | null;
  bookingLinks?: string | null;
  claimThisBusiness?: boolean | null;
  cid?: number;
  rank?: number | null;
  instagram?: string | null;
  facebook?: string | null;
  tiktok?: string | null;
  pinterest?: string | null;
  yellowpages?: string | null;
  yelp?: string | null;
  phone_scraped?: string | null;
  category_name?: string | null;
  plus_code?: string | null;
  women_owned?: boolean | null;
  appointment_required?: boolean | null;
  search_string?: string | null;
  image_url?: string | null;
  image_urls?: string[] | null;
  opening_hours?: OpeningHours | null;
}