-- Add title column to tattoo_images table
ALTER TABLE tattoo_images ADD COLUMN IF NOT EXISTS title text;

-- Create a search index for titles
CREATE INDEX IF NOT EXISTS idx_tattoo_images_title ON tattoo_images USING gin(to_tsvector('english', title));