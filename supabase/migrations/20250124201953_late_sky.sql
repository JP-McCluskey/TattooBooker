/*
  # Seed initial business data

  1. Data
    - Insert 3 sample tattoo businesses
    - Include all required fields and some optional fields
*/

INSERT INTO businesses (
  title,
  description,
  address,
  city,
  state,
  postal_code,
  phone_unformatted,
  website,
  total_score,
  reviews_count,
  images_count,
  instagram,
  category_name,
  appointment_required
) VALUES
(
  'Ink Masters Studio',
  'Premium tattoo studio specializing in custom designs and traditional artwork',
  '123 Main Street',
  'Los Angeles',
  'CA',
  '90012',
  '2135550123',
  'https://inkmastersstudio.com',
  4.8,
  156,
  45,
  '@inkmasters_la',
  'Tattoo Studio',
  true
),
(
  'Electric Needle Tattoo',
  'Contemporary tattoo parlor featuring talented artists and unique designs',
  '456 Broadway',
  'New York',
  'NY',
  '10013',
  '6465550189',
  'https://electricneedlenyc.com',
  4.9,
  203,
  78,
  '@electric_needle_nyc',
  'Tattoo Studio',
  true
),
(
  'Sacred Art Tattoo',
  'Traditional and modern tattoo styles in a welcoming environment',
  '789 Pike Street',
  'Seattle',
  'WA',
  '98101',
  '2065550147',
  'https://sacredarttattoo.com',
  4.7,
  167,
  52,
  '@sacred_art_sea',
  'Tattoo Studio',
  true
);