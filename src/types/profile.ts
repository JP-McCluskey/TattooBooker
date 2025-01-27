import { User } from '@supabase/supabase-js';

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
}

export interface ProfileValidation {
  full_name: boolean;
  phone: boolean;
  address: boolean;
  bio: boolean;
}

export interface ProfileFormState {
  data: ProfileFormData;
  isDirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
  errors: Partial<Record<keyof ProfileFormData, string>>;
}