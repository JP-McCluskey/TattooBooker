export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url: string | null;
  address: string | null;
  bio: string | null;
}

export interface ProfileFormData {
  full_name: string;
  phone: string;
  address: string;
  bio: string;
  hourly_rate?: string;
  minimum_charge?: string;
  website?: string;
  booking_link?: string;
  instagram?: string;
  facebook?: string;
  pinterest?: string;
}

export interface ProfileValidation {
  full_name: boolean;
  phone: boolean;
  address: boolean;
  bio: boolean;
  website?: boolean;
  booking_link?: boolean;
  instagram?: boolean;
  facebook?: boolean;
}

export interface ProfileFormState {
  data: ProfileFormData;
  isDirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
  errors: Partial<Record<keyof ProfileFormData, string>>;
}