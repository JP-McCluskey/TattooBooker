/*
  # Add additional fields to artists table

  1. New Fields
    - `hourly_rate` (numeric)
    - `minimum_charge` (numeric)
    - `currency` (text)
    - `bio` (text)
    - `website` (text)
    - `booking_link` (text)
    - `facebook` (text)
    - `instagram` (text)
    - `pinterest` (text)
    - `certificates` (text[])
    - `cover_image_url` (text)
    - `profile_image_url` (text)
    - `street` (text)
    - `building` (text)
    - `floor` (text)
    - `city` (text)
    - `state` (text)
    - `country` (text)
    - `postal_code` (text)
*/

ALTER TABLE artists
ADD COLUMN IF NOT EXISTS hourly_rate numeric,
ADD COLUMN IF NOT EXISTS minimum_charge numeric,
ADD COLUMN IF NOT EXISTS currency text,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS booking_link text,
ADD COLUMN IF NOT EXISTS facebook text,
ADD COLUMN IF NOT EXISTS instagram text,
ADD COLUMN IF NOT EXISTS pinterest text,
ADD COLUMN IF NOT EXISTS certificates text[],
ADD COLUMN IF NOT EXISTS cover_image_url text,
ADD COLUMN IF NOT EXISTS profile_image_url text,
ADD COLUMN IF NOT EXISTS street text,
ADD COLUMN IF NOT EXISTS building text,
ADD COLUMN IF NOT EXISTS floor text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS postal_code text;