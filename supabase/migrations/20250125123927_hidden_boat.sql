/*
  # User Roles and Relationships Schema

  1. New Tables
    - `roles` - User role definitions
    - `profiles` - Extended user information
    - `user_roles` - User to role mappings
    - `artists` - Tattoo artist profiles
    - `business_artists` - Relationship between businesses and artists

  2. Security
    - Enable RLS on all tables
    - Add policies for different roles
*/

-- Drop existing business_artists table if it exists
DROP TABLE IF EXISTS business_artists;

-- Modify businesses table to ensure proper primary key
ALTER TABLE businesses DROP CONSTRAINT IF EXISTS businesses_pkey;
ALTER TABLE businesses ADD PRIMARY KEY (id);

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  full_name text,
  avatar_url text,
  phone text,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_roles junction table
CREATE TABLE IF NOT EXISTS user_roles (
  user_id uuid REFERENCES auth.users(id),
  role_id bigint REFERENCES roles(id),
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, role_id)
);

-- Create artists table
CREATE TABLE IF NOT EXISTS artists (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  specialties text[],
  portfolio_url text,
  years_experience integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create business_artists junction table
CREATE TABLE IF NOT EXISTS business_artists (
  business_id bigint REFERENCES businesses(id),
  artist_id uuid REFERENCES artists(id),
  start_date date,
  end_date date,
  is_current boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (business_id, artist_id)
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
  ('user', 'Basic site user'),
  ('business_owner', 'Owner of a tattoo business'),
  ('artist', 'Tattoo artist'),
  ('admin', 'Site administrator');

-- Enable RLS on all tables
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_artists ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Roles policies
CREATE POLICY "Roles viewable by all users"
  ON roles FOR SELECT
  USING (true);

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- User roles policies
CREATE POLICY "User roles viewable by all"
  ON user_roles FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage user roles"
  ON user_roles
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'admin'
    )
  );

-- Artists policies
CREATE POLICY "Artists viewable by all"
  ON artists FOR SELECT
  USING (true);

CREATE POLICY "Artists can update own profile"
  ON artists FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Business artists policies
CREATE POLICY "Business artists viewable by all"
  ON business_artists FOR SELECT
  USING (true);

CREATE POLICY "Business owners can manage their artists"
  ON business_artists
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE id = business_id
      AND user_id = auth.uid()
    )
  );

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artists_updated_at
  BEFORE UPDATE ON artists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();