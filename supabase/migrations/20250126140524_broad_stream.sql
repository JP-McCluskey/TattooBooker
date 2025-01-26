/*
  # Add tattoo images table

  1. New Tables
    - `tattoo_images`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `artist_id` (uuid, references artists)
      - `business_id` (bigint, references businesses)
      - `placement` (text)
      - `styles` (text array)
      - `likes_count` (integer)
      - `favorites_count` (integer)
      - `image_url` (text)
      - `bucket_url` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `tattoo_images` table
    - Add policies for viewing and managing images
*/

-- Create tattoo_images table
CREATE TABLE IF NOT EXISTS tattoo_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  artist_id uuid REFERENCES artists(id),
  business_id bigint REFERENCES businesses(id),
  placement text NOT NULL,
  styles text[] NOT NULL,
  likes_count integer DEFAULT 0,
  favorites_count integer DEFAULT 0,
  image_url text,
  bucket_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE tattoo_images ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Images are viewable by everyone"
  ON tattoo_images
  FOR SELECT
  USING (true);

CREATE POLICY "Users can upload their own images"
  ON tattoo_images
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own images"
  ON tattoo_images
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_tattoo_images_updated_at
  BEFORE UPDATE ON tattoo_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data
INSERT INTO tattoo_images (
  placement,
  styles,
  image_url,
  likes_count,
  favorites_count
) VALUES
(
  'Forearm - Inner',
  ARRAY['Minimal', 'Fineline'],
  'https://images.unsplash.com/photo-1568515387631-8b650bbcdb90',
  124,
  45
),
(
  'Back - Upper',
  ARRAY['Geometric', 'Blackwork'],
  'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9',
  89,
  32
),
(
  'Leg - Calf',
  ARRAY['Traditional', 'Colored Realism'],
  'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8',
  156,
  67
);