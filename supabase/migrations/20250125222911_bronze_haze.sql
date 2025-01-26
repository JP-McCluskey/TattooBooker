/*
  # Add image and opening hours columns to businesses table

  1. Changes
    - Add `image_url` column for primary business image
    - Add `image_urls` column for additional business images
    - Add `opening_hours` column for business hours
    
  2. Notes
    - `image_url` is a single URL string for the main business image
    - `image_urls` is an array of URLs for additional business images
    - `opening_hours` is a JSONB field to store structured opening hours data
*/

DO $$ 
BEGIN
  -- Add image_url column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'businesses' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE businesses ADD COLUMN image_url text;
  END IF;

  -- Add image_urls column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'businesses' AND column_name = 'image_urls'
  ) THEN
    ALTER TABLE businesses ADD COLUMN image_urls text[];
  END IF;

  -- Add opening_hours column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'businesses' AND column_name = 'opening_hours'
  ) THEN
    ALTER TABLE businesses ADD COLUMN opening_hours jsonb;
  END IF;
END $$;