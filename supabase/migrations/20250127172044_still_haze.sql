-- Function to clean phone numbers
CREATE OR REPLACE FUNCTION clean_phone_number(phone text)
RETURNS text AS $$
BEGIN
  -- Remove all non-numeric characters except leading +
  RETURN regexp_replace(phone, '[^0-9+]', '', 'g');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update existing phone numbers in profiles table
UPDATE profiles 
SET phone = clean_phone_number(phone)
WHERE phone IS NOT NULL;

-- Update existing phone numbers in businesses table
UPDATE businesses 
SET phone_unformatted = clean_phone_number(phone_unformatted)
WHERE phone_unformatted IS NOT NULL;

-- Create trigger function to clean phone numbers on insert/update
CREATE OR REPLACE FUNCTION clean_phone_number_trigger()
RETURNS trigger AS $$
BEGIN
  IF NEW.phone IS NOT NULL THEN
    NEW.phone = clean_phone_number(NEW.phone);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function for businesses table
CREATE OR REPLACE FUNCTION clean_business_phone_trigger()
RETURNS trigger AS $$
BEGIN
  IF NEW.phone_unformatted IS NOT NULL THEN
    NEW.phone_unformatted = clean_phone_number(NEW.phone_unformatted);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS clean_phone_number_trigger ON profiles;
CREATE TRIGGER clean_phone_number_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION clean_phone_number_trigger();

DROP TRIGGER IF EXISTS clean_business_phone_trigger ON businesses;
CREATE TRIGGER clean_business_phone_trigger
  BEFORE INSERT OR UPDATE ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION clean_business_phone_trigger();