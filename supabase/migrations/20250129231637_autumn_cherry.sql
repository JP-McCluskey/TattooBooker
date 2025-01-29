/*
  # Booking Links URL Validation and Enhancement

  1. New Functions
    - validate_url: Validates URL structure and format
    - combine_urls: Combines base URL with relative path
    - enhance_booking_link: Main function to process and enhance booking links

  2. Changes
    - Adds URL validation and enhancement for booking links
    - Maintains data integrity by preserving valid URLs
    - Handles relative paths by combining with business website URL

  3. Security
    - Input validation to prevent malformed URLs
    - Safe URL combination logic
*/

-- Create function to validate URL structure
CREATE OR REPLACE FUNCTION validate_url(url text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN url ~* '^https?://[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}(/.*)?$';
END;
$$;

-- Create function to combine base URL with path
CREATE OR REPLACE FUNCTION combine_urls(base_url text, path text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  clean_base text;
  clean_path text;
BEGIN
  -- Clean base URL
  clean_base := rtrim(base_url, '/');
  
  -- Clean path
  IF path IS NULL THEN
    RETURN clean_base;
  END IF;
  
  clean_path := ltrim(path, '/');
  
  -- Combine URLs
  RETURN clean_base || '/' || clean_path;
END;
$$;

-- Create function to enhance booking link
CREATE OR REPLACE FUNCTION enhance_booking_link(booking_link text, website_url text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  enhanced_url text;
BEGIN
  -- Return null if both inputs are null
  IF booking_link IS NULL AND website_url IS NULL THEN
    RETURN NULL;
  END IF;

  -- If booking link is already a valid URL, return it
  IF validate_url(booking_link) THEN
    RETURN booking_link;
  END IF;

  -- If booking link starts with '/' or doesn't have protocol
  IF booking_link ~ '^/' OR booking_link !~ '^https?://' THEN
    -- Ensure website URL is valid
    IF NOT validate_url(website_url) THEN
      RETURN NULL;
    END IF;
    
    -- Combine website URL with booking link path
    enhanced_url := combine_urls(website_url, booking_link);
    
    -- Validate final URL
    IF validate_url(enhanced_url) THEN
      RETURN enhanced_url;
    END IF;
  END IF;

  -- If we can't enhance the URL, return null
  RETURN NULL;
END;
$$;

-- Create function to update all booking links
CREATE OR REPLACE FUNCTION update_all_booking_links()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE businesses
  SET booking_links = enhance_booking_link(booking_links, website)
  WHERE booking_links IS NOT NULL;
END;
$$;

-- Create trigger function to automatically enhance booking links
CREATE OR REPLACE FUNCTION enhance_booking_link_trigger()
RETURNS trigger AS $$
BEGIN
  NEW.booking_links := enhance_booking_link(NEW.booking_links, NEW.website);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS enhance_booking_link_trigger ON businesses;
CREATE TRIGGER enhance_booking_link_trigger
  BEFORE INSERT OR UPDATE OF booking_links, website ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION enhance_booking_link_trigger();

-- Create error logging table
CREATE TABLE IF NOT EXISTS url_validation_logs (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  business_id bigint REFERENCES businesses(id),
  original_booking_link text,
  original_website text,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on logs table
ALTER TABLE url_validation_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for logs
CREATE POLICY "Admins can view logs"
  ON url_validation_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'admin'
    )
  );

-- Function to log validation errors
CREATE OR REPLACE FUNCTION log_url_validation_error(
  p_business_id bigint,
  p_booking_link text,
  p_website text,
  p_error text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO url_validation_logs (
    business_id,
    original_booking_link,
    original_website,
    error_message
  ) VALUES (
    p_business_id,
    p_booking_link,
    p_website,
    p_error
  );
END;
$$;