/*
  # Initial schema for tattoo booking application

  1. New Tables
    - `businesses`
      - All fields from the Business interface
      - Added created_at and updated_at timestamps
      - Added user_id for ownership
  
  2. Security
    - Enable RLS on businesses table
    - Add policies for:
      - Public read access
      - Authenticated users can create businesses
      - Business owners can update their businesses
*/

CREATE TABLE IF NOT EXISTS businesses (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  place_id text,
  title text NOT NULL,
  description text,
  address text,
  neighborhood text,
  street text,
  city text,
  postal_code text,
  state text,
  latitude double precision,
  longitude double precision,
  country_code text,
  phone_unformatted text,
  website text,
  total_score numeric(3,2),
  reviews_count integer DEFAULT 0,
  images_count integer DEFAULT 0,
  permanently_closed boolean DEFAULT false,
  temporarily_closed boolean DEFAULT false,
  wheelchair_accessible boolean DEFAULT false,
  scraped_at timestamptz,
  booking_links text,
  claim_this_business boolean DEFAULT false,
  cid bigint,
  rank integer,
  instagram text,
  facebook text,
  tiktok text,
  pinterest text,
  yellowpages text,
  yelp text,
  phone_scraped text,
  category_name text,
  plus_code text,
  women_owned boolean DEFAULT false,
  appointment_required boolean DEFAULT true,
  search_string text,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Businesses are viewable by everyone" 
  ON businesses
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create businesses" 
  ON businesses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own businesses" 
  ON businesses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();